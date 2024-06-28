import "./Quiz.scss";
import axios from "axios";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const baseURL = import.meta.env.VITE_API_URL;

function Quiz() {
  const [quiz, setQuiz] = useState({
    generalPhishingQuestions: [],
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
    const selected = selectedAnswer[`${category}_${questionIndex}`];

    console.log(`Selected Answer: ${selected}`);
    console.log(`Correct Answer: ${correctAnswer}`);

    const isCorrect = selected === correctAnswer;
    setResult((prev) => ({
      ...prev,
      [`${category}_${questionIndex}`]: isCorrect ? "Correct" : "Wrong",
    }));

    if (!isCorrect) {
      setSelectedAnswer((prev) => ({
        ...prev,
        // Should allow for them to resubmit again if they got it wrong first.
        [`${category}_${questionIndex}`]: "",
      }));
    }
  };

  // The map function looked wayy too messy inside the return. Setting it to a variable here.
  const renderQuestion = (category, questions) => {
    return questions.map((q, index) => (
      <div key={`${category}_${index}`}>
        <h3>{q.question}</h3>
        {q.options.map((option, optIndex) => (
          <div key={`${category}_${index}_${optIndex}`}>
            <input
              type="radio"
              name={`${category}_${index}`}
              id={`${category}_${index}_${optIndex}`}
              value={option}
              onChange={() => handleAnswerSelect(category, index, option)}
            />
            <label htmlFor={`${category}_${index}_${optIndex}`}>{option}</label>
          </div>
        ))}
        <button onClick={() => handleSubmit(category, index)}>
          Submit Answer
        </button>
        {result[`${category}_${index}`] && (
          <p>{result[`${category}_${index}`]}</p>
        )}
      </div>
    ));
  };

  const renderScenarioQuestions = (scenarioIndex, scenario) => {
    return scenario.questions.map((q, index) => (
      <div key={`scenario_${scenarioIndex}_${index}`}>
        <h4>{q.question}</h4>
        {q.options.map((option, optIndex) => (
          <div key={`scenario_${scenarioIndex}_${index}_${optIndex}`}>
            <input
              type="radio"
              id={`scenario_${scenarioIndex}_${index}_${optIndex}`}
              name={`scenario_${scenarioIndex}_${index}`}
              value={option}
              onChange={() =>
                handleAnswerSelect(`scenario_${scenarioIndex}`, index, option)
              }
            />
            <label htmlFor={`scenario_${scenarioIndex}_${index}_${optIndex}`}>
              {option}
            </label>
          </div>
        ))}
        <button
          onClick={() => handleSubmit(`scenario_${scenarioIndex}`, index)}
        >
          Submit Answer
        </button>
        {result[`scenario_${scenarioIndex}_${index}`] && (
          <p>{result[`scenario_${scenarioIndex}_${index}`]}</p>
        )}
      </div>
    ));
  };

  //   if (
  //     quiz.generalPhishingQuestions.length === 0 &&
  //     quiz.generalSecurityQuestions.length === 0 &&
  //     quiz.scenarioBasedQuestions.length === 0
  //   ) {
  //     return <div>Loading...</div>;
  //   }

  return (
    <main>
      <section>
        <h2>General Phishing Questions</h2>
        {renderQuestion(
          "generalPhishingQuestions",
          quiz.generalPhishingQuestions
        )}
      </section>
      <section>
        <h2>General Security Questions</h2>
        {renderQuestion(
          "generalSecurityQuestions",
          quiz.generalSecurityQuestions
        )}
      </section>
      <section>
        <h2>Scenario Based Questions</h2>
        {quiz.scenarioBasedQuestions.map((scenario, scenarioIndex) => (
          <div key={`scenario_${scenarioIndex}`}>
            <h3>{scenario.scenario}</h3>
            <p>{scenario.description}</p>
            {renderScenarioQuestions(scenarioIndex, scenario)}
          </div>
        ))}
      </section>
    </main>
  );
}

export default Quiz;
