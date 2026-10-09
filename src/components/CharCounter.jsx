const NEAR_LIMIT_RATIO = 0.9;

const CharCounter = ({ value = "", maxLength = 5000 }) => {
  const length = (value || "").length;
  const nearLimit = maxLength > 0 && length / maxLength >= NEAR_LIMIT_RATIO;
  return (
    <p
      role="status"
      className={`mt-1 text-[11px] ${nearLimit ? "font-semibold text-red-500" : "text-gray-400 dark:text-text-muted"}`}
    >
      {length} / {maxLength} characters{nearLimit ? " — near limit" : ""}
    </p>
  );
};

export default CharCounter;
