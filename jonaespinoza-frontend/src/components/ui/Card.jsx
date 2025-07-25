import React from "react";

const Card = ({ children, variant = "default", className = "", ...props }) => {
  const baseClasses = "rounded-xl shadow-md transition-all duration-300";

  const variants = {
    default:
      "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
    elevated: "bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl",
    outlined: "border-2 border-primary/20 bg-transparent",
    glass: "bg-white/10 backdrop-blur-md border border-white/20",
  };

  const classes = `${baseClasses} ${variants[variant]} ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card;
