import "./Quiz.scss";
import axios from "axios";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import aeIcon from "../../assets/imgs/ae-icon.png";

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
    const correctAnswer = category.startsWith("scenarioBasedQuestions")
      ? quiz.scenarioBasedQuestions[parseInt(category.split("_")[1])].questions[
          questionIndex
        ].answer
      : quiz[category][questionIndex].answer;

    const selected = selectedAnswer[`${category}_${questionIndex}`];

    console.log(`Selected Answer: ${selected}`);
    console.log(`Correct Answer: ${correctAnswer}`);

    const isCorrect = selected === correctAnswer;

    setResult((prev) => ({
      ...prev,
      [`${category}_${questionIndex}`]: isCorrect ? "Correct" : "Try Again",
    }));

    if (isCorrect) {
      handleNextQuestion();
    } else {
      setSelectedAnswer((prev) => ({
        ...prev,
        // Should allow for them to resubmit again if they got it wrong first.
        [`${category}_${questionIndex}`]: "",
      }));
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    }
  };
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0)
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

  return (
    <main>
      <section className="quiz">
        <div className="quiz__header">
          <div className="quiz__head">
            <button
              className="quiz__back-button"
              onClick={handlePreviousQuestion}
            >
              {"<"}
            </button>
            <h3 className="page__header">QUIZ</h3>
            <img className="quiz__logo" src={aeIcon} alt="logo" />
          </div>
          <div className="quiz__title-container">
            <h2 className="quiz__title">
              {formatCategoryName(currentCategoryMapping.category)}
            </h2>
            {currentQuestion.scenario && (
              <h3 className="quiz__question">{currentQuestion.scenario}</h3>
            )}
            {currentQuestion.description && (
              <p className="quiz__description">{currentQuestion.description}</p>
            )}
            <h3 className="quiz__question">{currentQuestion.question}</h3>
          </div>
        </div>
        <div className="quiz__question--container">
          {currentQuestion.options.map((option, optIndex) => (
            <div
              key={`${currentCategoryMapping.category}_${currentCategoryMapping.index}_${optIndex}`}
              className={`option ${
                selectedAnswer[
                  `${currentCategoryMapping.category}_${currentCategoryMapping.index}`
                ] === option
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                handleAnswerSelect(
                  currentCategoryMapping.category,
                  currentCategoryMapping.index,
                  option
                )
              }
            >
              {option}
            </div>
          ))}
          <button
            className="quiz__submit-button"
            onClick={() =>
              handleSubmit(
                currentCategoryMapping.category,
                currentCategoryMapping.index
              )
            }
          >
            Submit
          </button>
          {result[
            `${currentCategoryMapping.category}_${currentCategoryMapping.index}`
          ] && (
            <p className="quiz__result">
              {
                result[
                  `${currentCategoryMapping.category}_${currentCategoryMapping.index}`
                ]
              }
            </p>
          )}
        </div>
        {/* <div>
          {currentQuestionIndex > 0 && (
            <button onClick={handlePreviousQuestion}>Previous Question</button>
          )}
          {currentQuestionIndex < allQuestions.length - 1 && (
            <button onClick={handleNextQuestion}>Next Question</button>
          )}
        </div> */}
      </section>
    </main>
  );
}

export default Quiz;
