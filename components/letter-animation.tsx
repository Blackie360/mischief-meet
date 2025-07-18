"use client"

import { useEffect, useState } from "react"

export function LetterAnimation() {
  const [letters, setLetters] = useState<Array<{ id: number; x: number; y: number; rotation: number }>>([])

  useEffect(() => {
    const createLetter = () => {
      const newLetter = {
        id: Date.now() + Math.random(),
        x: Math.random() * 300,
        y: 300,
        rotation: Math.random() * 360,
      }

      setLetters((prev) => [...prev, newLetter])

      // Remove letter after animation
      setTimeout(() => {
        setLetters((prev) => prev.filter((letter) => letter.id !== newLetter.id))
      }, 4000)
    }

    const interval = setInterval(createLetter, 1500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-80 h-80 mx-auto">
      {/* Central Calendar */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-3xl">📅</span>
        </div>
      </div>

      {/* Floating Letters */}
      {letters.map((letter) => (
        <div
          key={letter.id}
          className="absolute text-2xl animate-float"
          style={{
            left: `${letter.x}px`,
            top: `${letter.y}px`,
            transform: `rotate(${letter.rotation}deg)`,
            animation: "float 4s ease-out forwards",
          }}
        >
          📧
        </div>
      ))}
    </div>
  )
}
