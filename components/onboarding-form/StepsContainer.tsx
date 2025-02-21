interface StepsContainerProps {
  currentStep: number;
}

export default function StepsContainer({ currentStep }: StepsContainerProps) {
  return (
    <div className="progress-bar">
      <div className={`progress-step ${currentStep === 1 ? 'progress-step-active' : currentStep > 1 ? 'progress-step-completed' : 'progress-step-upcoming'}`}>
        1
      </div>
      <div className={`progress-line ${currentStep >= 2 ? 'progress-line-active' : 'progress-line-inactive'}`} />
      <div className={`progress-step ${currentStep === 2 ? 'progress-step-active' : currentStep > 2 ? 'progress-step-completed' : 'progress-step-upcoming'}`}>
        2
      </div>
      <div className={`progress-line ${currentStep >= 3 ? 'progress-line-active' : 'progress-line-inactive'}`} />
      <div className={`progress-step ${currentStep === 3 ? 'progress-step-active' : currentStep > 3 ? 'progress-step-completed' : 'progress-step-upcoming'}`}>
        3
      </div>
    </div>
  );
} 