import "./Quiz.scss";
import axios from "axios";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const baseURL = import.meta.env.VITE_API_URL;

function Quiz() {
  const [quiz, setQuiz] = useState({
    generalPhisingQuestions: [],
    generalSecurityQuestions: [],
    scenarioBasedQuestions: [],
  });

  const [selectedAnswer, setSelectedAnswer] = useState({});
  const [result, setResult] = useState({});

  const fetchQuiz = async () => {
    try {
      const response = await axios.get(`${baseURL}/fraud-quiz`);
      setQuiz(response.data);
    } catch (error) {
      console.log("Error fetching the quiz", error);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, []);

  const handleAnswerSelect = (category, questionIndex, option) => {
    setSelectedAnswer((prev) => ({
      ...prev,
      [`${category}_${questionIndex}`]: option,
    }));
  };

  const handleSubmit = (category, questionIndex) => {
    const correctAnswer = quiz[category][questionIndex].answer;
    const isCorrect =
      selectedAnswer[`${category}_${questionIndex}`] === correctAnswer;
    setResult((prev) => ({
      ...prev,
      [`${category}_${questionIndex}`]: isCorrect ? "Correct" : "Wrong",
    }));
  };

  return (
    <>
      <main>
        {quiz.map((q) => {
          <h3>{q.gerneral}</h3>;
        })}
      </main>
    </>
  );
}

export default Quiz;
