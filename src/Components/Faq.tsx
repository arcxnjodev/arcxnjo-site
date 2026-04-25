export const Faq = () => {
  return (
    <div className="w-full my-[50px]">
      <h1 className="text-center text-white text-6xl my-5">FAQ</h1>
      <div
        id="accordion-collapse"
        data-accordion="collapse"
        className="w-[40%] flex flex-col mx-auto gap-4"
      >
        <div>
          <h2 id="accordion-collapse-heading-1">
            <button
              type="button"
              className="flex items-center justify-between w-full p-5 font-medium rtl:text-right text-gray-500 border border-gray-800 rounded-t-xl focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 gap-3"
              data-accordion-target="#accordion-collapse-body-1"
              aria-expanded="true"
              aria-controls="accordion-collapse-body-1"
            >
              <span>What is ARCXNJO?</span>
              <svg
                data-accordion-icon
                className="w-3 h-3 rotate-180 shrink-0"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5 5 1 1 5"
                />
              </svg>
            </button>
          </h2>
          <div
            id="accordion-collapse-body-1"
            className="hidden"
            aria-labelledby="accordion-collapse-heading-1"
          >
            <div className="p-5 border dark:border-gray-700 dark:bg-gray-900">
              <p className="mb-2 text-white dark:text-gray-400">
                ARCXNJO is a platform that provides modern, feature-rich bio links as well as secure file hosting services.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 id="accordion-collapse-heading-2">
            <button
              type="button"
              className="flex items-center justify-between w-full p-5 font-medium rtl:text-right text-gray-500 border border-gray-200 rounded-t-xl focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 gap-3"
              data-accordion-target="#accordion-collapse-body-2"
              aria-expanded="true"
              aria-controls="accordion-collapse-body-2"
            >
              <span>Is ARCXNJO free to use?</span>
              <svg
                data-accordion-icon
                className="w-3 h-3 rotate-180 shrink-0"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5 5 1 1 5"
                />
              </svg>
            </button>
          </h2>
          <div
            id="accordion-collapse-body-2"
            className="hidden"
            aria-labelledby="accordion-collapse-heading-2"
          >
            <div className="p-5 border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
              <p className="mb-2 text-white dark:text-gray-400">
                Yes, ARCXNJO is completely free to use. However, we also offer a Premium package with exclusive features.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 id="accordion-collapse-heading-3">
            <button
              type="button"
              className="flex items-center justify-between w-full p-5 font-medium rtl:text-right text-gray-500 border border-gray-200 rounded-t-xl focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3"
              data-accordion-target="#accordion-collapse-body-3"
              aria-expanded="true"
              aria-controls="accordion-collapse-body-3"
            >
              <span>What can I do with ARCXNJO?</span>
              <svg
                data-accordion-icon
                className="w-3 h-3 rotate-180 shrink-0"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5 5 1 1 5"
                />
              </svg>
            </button>
          </h2>
          <div
            id="accordion-collapse-body-3"
            className="hidden"
            aria-labelledby="accordion-collapse-heading-3"
          >
            <div className="p-5 border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
              <p className="mb-2 text-white dark:text-gray-400">
                With ARCXNJO, you can connect all your social media links in one place, making it easy to share your online presence with others.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 id="accordion-collapse-heading-4">
            <button
              type="button"
              className="flex items-center justify-between w-full p-5 font-medium rtl:text-right text-gray-500 border border-gray-200 rounded-t-xl focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3"
              data-accordion-target="#accordion-collapse-body-4"
              aria-expanded="true"
              aria-controls="accordion-collapse-body-4"
            >
              <span>How long does it take to create a ARCXNJO profile?</span>
              <svg
                data-accordion-icon
                className="w-3 h-3 rotate-180 shrink-0"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5 5 1 1 5"
                />
              </svg>
            </button>
          </h2>
          <div
            id="accordion-collapse-body-4"
            className="hidden"
            aria-labelledby="accordion-collapse-heading-4"
          >
            <div className="p-5 border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
              <p className="mb-2 text-white dark:text-gray-400">
                Creating your ARCXNJO profile is quick and easy. Just create an account and start customizing your profile right away.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};