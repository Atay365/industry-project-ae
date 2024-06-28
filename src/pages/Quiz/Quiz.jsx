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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

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

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
  };

  const handlePreviousQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
  };

  const getAllQuestions = () => {
    let allQuestions = [];
    let questionCategoryMapping = [];

    quiz.generalPhishingQuestions.forEach((question, index) => {
      allQuestions.push({ ...question, scenario: null, description: null });
      questionCategoryMapping.push({
        category: "generalPhishingQuestions",
        index,
      });
    });

    quiz.generalSecurityQuestions.forEach((question, index) => {
      allQuestions.push({ ...question, scenario: null, description: null });
      questionCategoryMapping.push({
        category: "generalSecurityQuestions",
        index,
      });
    });

    quiz.scenarioBasedQuestions.forEach((scenario, scenarioIndex) => {
      scenario.questions.forEach((question, index) => {
        allQuestions.push({
          ...question,
          scenario: scenario.scenario,
          description: scenario.description,
        });
        questionCategoryMapping.push({
          category: `scenarioBasedQuestions_${scenarioIndex}`,
          index,
        });
      });
    });

    return { allQuestions, questionCategoryMapping };
  };

  const formatCategoryName = (category) => {
    if (category.startsWith("scenarioBasedQuestions")) {
      return "Scenario Based Questions";
    }

    return category
      .replace(/([A-Z])/g, " $1") // Insert space before capital letters
      .replace(/^./, (str) => str.toUpperCase()) // Capitalize the first letter
      .replace(/_/g, " ");
  };

  const { allQuestions, questionCategoryMapping } = getAllQuestions();
  const currentQuestion = allQuestions[currentQuestionIndex];
  const currentCategoryMapping = questionCategoryMapping[currentQuestionIndex];

  if (!currentQuestion || !currentCategoryMapping) {
    return <div>Loading...</div>;
  }

  // The map function looked wayy too messy inside the return. Setting it to a variable here.
  //   const renderQuestion = (category, questions) => {
  //     return questions.map((q, index) => (
  //       <div key={`${category}_${index}`}>
  //         <h3>{q.question}</h3>
  //         {q.options.map((option, optIndex) => (
  //           <div key={`${category}_${index}_${optIndex}`}>
  //             <input
  //               type="radio"
  //               name={`${category}_${index}`}
  //               id={`${category}_${index}_${optIndex}`}
  //               value={option}
  //               onChange={() => handleAnswerSelect(category, index, option)}
  //             />
  //             <label htmlFor={`${category}_${index}_${optIndex}`}>{option}</label>
  //           </div>
  //         ))}
  //         <button onClick={() => handleSubmit(category, index)}>
  //           Submit Answer
  //         </button>
  //         {result[`${category}_${index}`] && (
  //           <p>{result[`${category}_${index}`]}</p>
  //         )}
  //       </div>
  //     ));
  //   };

  //   const renderScenarioQuestions = (scenarioIndex, scenario) => {
  //     return scenario.questions.map((q, index) => (
  //       <div key={`scenario_${scenarioIndex}_${index}`}>
  //         <h4>{q.question}</h4>
  //         {q.options.map((option, optIndex) => (
  //           <div key={`scenario_${scenarioIndex}_${index}_${optIndex}`}>
  //             <input
  //               type="radio"
  //               id={`scenario_${scenarioIndex}_${index}_${optIndex}`}
  //               name={`scenario_${scenarioIndex}_${index}`}
  //               value={option}
  //               onChange={() =>
  //                 handleAnswerSelect(`scenario_${scenarioIndex}`, index, option)
  //               }
  //             />
  //             <label htmlFor={`scenario_${scenarioIndex}_${index}_${optIndex}`}>
  //               {option}
  //             </label>
  //           </div>
  //         ))}
  //         <button
  //           onClick={() => handleSubmit(`scenario_${scenarioIndex}`, index)}
  //         >
  //           Submit Answer
  //         </button>
  //         {result[`scenario_${scenarioIndex}_${index}`] && (
  //           <p>{result[`scenario_${scenarioIndex}_${index}`]}</p>
  //         )}
  //       </div>
  //     ));
  //   };

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
        <h2>{formatCategoryName(currentCategoryMapping.category)}</h2>
        {currentQuestion.scenario && <h3>{currentQuestion.scenario}</h3>}
        {currentQuestion.description && <p>{currentQuestion.description}</p>}
        <div>
          <h3>{currentQuestion.question}</h3>
          {currentQuestion.options.map((option, optIndex) => (
            <div
              key={`${currentCategoryMapping.category}_${currentCategoryMapping.index}_${optIndex}`}
            >
              <input
                type="radio"
                name={`${currentCategoryMapping.category}_${currentCategoryMapping.index}`}
                id={`${currentCategoryMapping.category}_${currentCategoryMapping.index}_${optIndex}`}
                value={option}
                onChange={() =>
                  handleAnswerSelect(
                    currentCategoryMapping.category,
                    currentCategoryMapping.index,
                    option
                  )
                }
              />
              <label
                htmlFor={`${currentCategoryMapping.category}_${currentCategoryMapping.index}_${optIndex}`}
              >
                {option}
              </label>
            </div>
          ))}
          <button
            onClick={() =>
              handleSubmit(
                currentCategoryMapping.category,
                currentCategoryMapping.index
              )
            }
          >
            Submit Answer
          </button>
          {result[
            `${currentCategoryMapping.category}_${currentCategoryMapping.index}`
          ] && (
            <p>
              {
                result[
                  `${currentCategoryMapping.category}_${currentCategoryMapping.index}`
                ]
              }
            </p>
          )}
        </div>
        <div>
          {currentQuestionIndex > 0 && (
            <button onClick={handlePreviousQuestion}>Previous Question</button>
          )}
          {currentQuestionIndex < allQuestions.length - 1 && (
            <button onClick={handleNextQuestion}>Next Question</button>
          )}
        </div>
      </section>
    </main>
  );
}

export default Quiz;
