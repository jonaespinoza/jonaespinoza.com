import Text from "./Text";

function Footer() {
  return (
    <footer className="w-full border-t border-gray-300 dark:border-gray-700 mt-16 px-4 py-6 text-sm text-center">
      <Text
        tKey="footer.copyright"
        className="text-black dark:text-gray-100"
        as="p"
      />
    </footer>
  );
}

export default Footer;