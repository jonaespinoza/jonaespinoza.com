import { FiChevronDown } from "react-icons/fi";

function ExpandableSectionHeader({ title, isOpen, toggle }) {
  return (
    <div className="flex justify-center items-center w-full mb-4">
      <h1 className="text-4xl font-bold text-primary dark:text-primary-light flex items-center">
        {title}
        <button
          onClick={toggle}
          className="ml-2 p-1 rounded hover:bg-gray-500 dark:hover:bg-gray-400 transition-colors"
          aria-label="Toggle section"
        >
          <FiChevronDown
            className={`transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </h1>
    </div>
  );
}

export default ExpandableSectionHeader;
