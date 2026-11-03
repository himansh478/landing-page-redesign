# Makes English speech with known word times, for scripts/benchmark.mjs.
# The Windows voice reports exactly where each word starts in its own audio,
# which gives a true answer to compare our timing against.
# The file must be 16 kHz: the voice counts position at 16 kHz, so at any other
# rate its word times run ahead of the audio (at 22 kHz, by a factor of 1.378).
param([string]$Out = "work\benchmark")

Add-Type -AssemblyName System.Speech
New-Item -ItemType Directory -Force -Path $Out | Out-Null
$Out = (Resolve-Path $Out).Path

$passages = @(
  "Welcome back to the channel. Today I will show you how to add perfect captions to your videos. First, upload your clip. Then choose a style you like, and export it in full quality.",
  "Most creators lose viewers in the first three seconds. A strong hook tells people exactly what they will get. Keep your sentences short, cut every pause, and put the main point on the screen.",
  "If your reel looks blurry after you upload it, the problem is usually your export settings. Use a high bitrate, keep the frame rate the same as your footage, and never upload the same file twice.",
  "Good lighting matters more than an expensive camera. Stand facing a window, turn off the room lights, and record in the morning. Your skin will look natural and your video will feel professional."
)
$voices = @("Microsoft David Desktop", "Microsoft Zira Desktop")
$rates = @(0, 3)

$script:words = $null
foreach ($p in 0..($passages.Count - 1)) {
  foreach ($voice in $voices) {
    foreach ($rate in $rates) {
      $name = "p$p-$($voice.Split(' ')[1].ToLower())-r$rate"
      $path = Join-Path $Out "$name.wav"
      $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
      $synth.SelectVoice($voice)
      $synth.Rate = $rate
      $format = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(16000, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)
      $synth.SetOutputToWaveFile($path, $format)

      $script:words = New-Object System.Collections.ArrayList
      $handler = [System.EventHandler[System.Speech.Synthesis.SpeakProgressEventArgs]] {
        param($sender, $e)
        [void]$script:words.Add([pscustomobject]@{ text = $e.Text; start = $e.AudioPosition.TotalSeconds })
      }
      $synth.add_SpeakProgress($handler)
      $synth.Speak($passages[$p])
      $synth.remove_SpeakProgress($handler)
      $synth.Dispose()

      [pscustomobject]@{ text = $passages[$p]; words = @($script:words) } |
        ConvertTo-Json -Depth 4 |
        Out-File -FilePath (Join-Path $Out "$name.gold.json") -Encoding utf8
      "$name  $($script:words.Count) words"
    }
  }
}
