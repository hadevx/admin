import Layout from "../Layout";

const Error = () => {
  return (
    <Layout>
      <div className="flex w-full flex-col justify-center items-center min-h-screen px-4 text-center">
        <svg
          className="w-16 h-16 text-red-500 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
          />
        </svg>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong.</h1>
        <p className="text-gray-600 max-w-md">
          An unexpected error occurred. Please try again later.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
          Retry
        </button>
      </div>
    </Layout>
  );
};

export default Error;
