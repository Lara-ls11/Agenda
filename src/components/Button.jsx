function Button({ children }) {
  return (
    <button className="bg-[#D9A5AE] hover:bg-[#C98D98] text-white font-medium px-8 py-4 rounded-full transition duration-300 shadow-md">
      {children}
    </button>
  );
}

export default Button;