const CharCounter = ({ value = "", maxLength = 5000 }) => {
  return (
    <p className="mt-1 text-[11px] text-gray-400 dark:text-text-muted">
      {value.length} / {maxLength} characters
    </p>
  );
};

export default CharCounter;