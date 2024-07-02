import { ButtonHTMLAttributes, HTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>{
  isLoading?: boolean
};

export function Button({ children, className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`flex px-3 py-2 rounded-md justify-center ${className}`}
    >
      {children}
    </button>
  );
};


export function PrimaryButton({ className, isLoading, ...props }: ButtonProps) {
  return (
    <Button
      {...props}
      className={`text-white bg-secondary hover:bg-secondary-light ${className} ${
        isLoading ? "animate-pulse" : ""
      }`}
    />
  );
};

export function DeleteButton({ className, isLoading, ...props }: ButtonProps) {
  return (
    <Button
      {...props}
      className={`text-rose-500 border-2 border-rose-500 hover:bg-rose-500 hover:text-white ${className} ${
        isLoading ? "animate-pulse" : ""
      }`}
    />
  );
};

interface ErrorMessageProps extends HTMLAttributes<HTMLParagraphElement>{}

export function ErrorMessage({className, ...props}: ErrorMessageProps) {
  return (
    <p {...props} className={`text-xs text-red-500 ${className}`}/>
  )
}
