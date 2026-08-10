import { useState, useRef, useCallback, useEffect } from 'react'

export type RecordingState = 'idle' | 'recording' | 'denied'

/**
 * useVoiceRecording — manages MediaRecorder lifecycle (Req 31.1–31.7).
 *
 * Features:
 * - Capability detection (navigator.mediaDevices.getUserMedia)
 * - Elapsed-time tracking
 * - Mic-denied error state
 * - 60s auto-stop
 * - Manual stop ≥1s finalizes, <1s discards
 * - Cancel discards
 */
export function useVoiceRecording() {
  const [state, setState] = useState<RecordingState>('idle')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(0)

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    mediaRecorderRef.current?.stream?.getTracks().forEach((t) => t.stop())
    mediaRecorderRef.current = null
    chunksRef.current = []
  }, [])

  // Clean up on unmount
  useEffect(() => cleanup, [cleanup])

  const startRecording = useCallback(async () => {
    // Capability detection
    if (!navigator.mediaDevices?.getUserMedia) {
      setState('denied')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000
        if (elapsed >= 1) {
          // Finalize — produce blob
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
          setAudioBlob(blob)
        }
        // If < 1s, discard (no blob set)
        chunksRef.current = []
        setState('idle')
        setElapsedSeconds(0)
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        stream.getTracks().forEach((t) => t.stop())
      }

      recorder.start()
      startTimeRef.current = Date.now()
      setState('recording')
      setAudioBlob(null)

      // Track elapsed seconds
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        setElapsedSeconds(elapsed)

        // Auto-stop at 60 seconds (Req 31.7)
        if (elapsed >= 60) {
          recorder.stop()
        }
      }, 1000)
    } catch {
      setState('denied')
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  const cancelRecording = useCallback(() => {
    // Discard — don't produce blob
    startTimeRef.current = Date.now() // Forces < 1s condition in onstop
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    cleanup()
    setState('idle')
    setElapsedSeconds(0)
  }, [cleanup])

  const consumeAudioBlob = useCallback(() => {
    const blob = audioBlob
    setAudioBlob(null)
    return blob
  }, [audioBlob])

  return {
    state,
    elapsedSeconds,
    audioBlob,
    startRecording,
    stopRecording,
    cancelRecording,
    consumeAudioBlob,
  }
}
