'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type DragEvent } from 'react';
import { AccountBar } from '@/captions/components/AccountBar';
import { VocabularyField } from '@/captions/components/VocabularyField';
import { useAccount } from '@/captions/lib/account';
import { accountsOn, supabase } from '@/captions/lib/auth';
import { browserProblem } from '@/captions/lib/browser';
import { createProject, OutOfMinutes, type Stage } from '@/captions/lib/ingest';
import type { Project } from '@/captions/lib/project';
import { deleteProject, listProjects, readMedia } from '@/captions/lib/storage';
import { deleteCloudProject, listCloudProjects, restoreProject, type CloudProject } from '@/captions/lib/sync';

const STAGES: { id: Stage; label: string }[] = [
  { id: 'reading', label: 'Reading your video' },
  { id: 'transcribing', label: 'Listening to the speech' },
  { id: 'converting', label: 'Writing Hinglish and Hindi' },
  { id: 'aligning', label: 'Timing every word' },
];

const seconds = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

const AGES: [Intl.RelativeTimeFormatUnit, number][] = [
  ['day', 86400000],
  ['hour', 3600000],
  ['minute', 60000],
];

function edited(time: number) {
  const age = Date.now() - time;
  const [unit, size] = AGES.find(([, length]) => age >= length) ?? ['minute', 60000];
  return `Edited ${new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(-Math.floor(age / size), unit)}`;
}

export default function Home() {
  const router = useRouter();
  const { ready, signedIn, email, account, refused, refresh } = useAccount();
  const [projects, setProjects] = useState<Project[]>([]);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [cloud, setCloud] = useState<CloudProject[]>([]);
  const [stage, setStage] = useState<Stage | null>(null);
  const [fraction, setFraction] = useState<number | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [needsMinutes, setNeedsMinutes] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [over, setOver] = useState(false);

  useEffect(() => {
    setProblem(browserProblem());
    listProjects().then(setProjects);
  }, []);

  useEffect(() => {
    for (const { id } of projects) {
      readMedia(id, 'thumb')
        .then((file) => setThumbs((known) => (known[id] ? known : { ...known, [id]: URL.createObjectURL(file) })))
        .catch(() => {});
    }
  }, [projects]);

  useEffect(() => {
    if (signedIn) listCloudProjects().then(setCloud).catch(() => {});
  }, [signedIn]);

  const start = async (file?: File) => {
    if (!file) return;
    setError(null);
    setNeedsMinutes(false);
    try {
      const id = await createProject(file, (next, part) => {
        setStage(next);
        setFraction(part);
      });
      router.push(`/ai-caption/studio/${id}`);
    } catch (e) {
      setStage(null);
      setNeedsMinutes(e instanceof OutOfMinutes);
      setError(e instanceof Error ? e.message : 'Something went wrong.');
      refresh();
    }
  };

  const remove = async (id: string) => {
    await deleteProject(id).catch(() => {});
    await deleteCloudProject(id).catch(() => {});
    setProjects((list) => list.filter((p) => p.id !== id));
    setCloud((list) => list.filter((p) => p.id !== id));
  };

  const restore = async (row: CloudProject, file?: File) => {
    if (!file) return;
    setError(null);
    try {
      await restoreProject(row, file);
      router.push(`/ai-caption/studio/${row.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't open this project.");
    }
  };

  const drop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    start(e.dataTransfer.files[0]);
  };

  const now = stage ? STAGES.findIndex((s) => s.id === stage) : -1;
  const locked = accountsOn && !signedIn;
  const elsewhere = cloud.filter((row) => !projects.some((p) => p.id === row.id));

  return (
    <main className="home">
      <AccountBar ready={ready} signedIn={signedIn} account={account} />
      <h1>Cwaya Captions</h1>
      <p className="lead">
        Word-perfect captions for Hindi, Hinglish and English videos. Your video stays on your device. Only the sound is sent for transcription.
      </p>
      {problem && <p className="error">{problem}</p>}

      {locked ? (
        ready && (
          <section className="progress">
            <strong>Sign in to make captions</strong>
            <p className="notice-line">Use your Cwaya account, or create one. Every account gets free minutes each month.</p>
            <Link href="/ai-caption/login">
              <button className="primary" id="sign-in">
                Sign in
              </button>
            </Link>
          </section>
        )
      ) : refused ? (
        // Turned away before choosing a video, so nobody waits for an upload that will be refused.
        <section className="progress" id="refused">
          <strong>{refused}</strong>
          <p className="notice-line">
            You&apos;re signed in as {email ?? 'an account that is not on the list'}. Ask Cwaya to add this email, or sign out and use your team account.
          </p>
          <button onClick={() => supabase?.auth.signOut()}>Sign out</button>
        </section>
      ) : stage ? (
        <section className="progress" aria-live="polite">
          <strong>Making your captions</strong>
          <p className="notice-line">Usually about a minute.</p>
          <ul className="steps">
            {STAGES.map((s, i) => (
              <li key={s.id} className={i === now ? 'now' : i < now ? 'past' : ''}>
                {s.label}
                {i === now && fraction !== undefined && ` ${Math.round(fraction * 100)}%`}
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <label
          className={`drop ${over ? 'over' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={drop}
        >
          <input id="file" type="file" accept="video/*" onChange={(e) => start(e.target.files?.[0])} />
          <strong>Choose a video, or drop it here</strong>
          <span>MP4 or MOV, up to 1 minute</span>
        </label>
      )}
      {error && <p className="error">{error}</p>}
      {needsMinutes && (
        <p>
          <Link href="/ai-caption/account">Get more minutes</Link>
        </p>
      )}
      {!stage && !locked && !refused && <VocabularyField />}

      {projects.length > 0 && (
        <section className="projects">
          <h2>Your projects</h2>
          {projects.map((p) => (
            <div className="project-row" key={p.id}>
              <Link href={`/ai-caption/studio/${p.id}`} className="project-link">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {thumbs[p.id] ? <img src={thumbs[p.id]} alt="" /> : <i aria-hidden />}
                <span>
                  <b>{p.name}</b>
                  <small>
                    {seconds(p.media.duration)} · {edited(p.updatedAt)}
                  </small>
                </span>
              </Link>
              <button className="ghost" onClick={() => remove(p.id)}>
                Delete
              </button>
            </div>
          ))}
        </section>
      )}

      {elsewhere.length > 0 && (
        <section className="projects">
          <h2>On your other devices</h2>
          {elsewhere.map((row) => (
            <div className="project-row" key={row.id}>
              <div className="project-info">
                <b>{row.name}</b>
                <small>Captions are saved. Choose your copy of the video to open it here.</small>
              </div>
              <label className="pick">
                Choose video
                <input type="file" accept="video/*" onChange={(e) => restore(row, e.target.files?.[0])} />
              </label>
              <button className="ghost" onClick={() => remove(row.id)}>
                Delete
              </button>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
