import { useStore } from './store';

export const SubmitButton = () => {
  const submitPipeline = useStore((state) => state.submitPipeline);
  const isSubmitting = useStore((state) => state.isSubmitting);

  return (
    <button
      type="button"
      className="submitBtn"
      onClick={() => submitPipeline()}
      disabled={isSubmitting}
    >
      {isSubmitting ? 'Analyzing…' : 'Analyze pipeline'}
    </button>
  );
};
