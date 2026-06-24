export interface TriviaQuestion {
  question: string
  correct_answer: string
  incorrect_answers: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
}

export async function fetchTriviaQuestion(
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
): Promise<TriviaQuestion | null> {
  try {
    const res = await fetch(
      `https://opentdb.com/api.php?amount=1&difficulty=${difficulty}&type=multiple`,
    )
    const data = await res.json()
    if (data.response_code !== 0) {
      return null
    }
    return data.results[0] as TriviaQuestion
  } catch {
    return null
  }
}
