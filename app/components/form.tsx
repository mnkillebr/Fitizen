import clsx from "clsx";
import { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>{
  isLoading?: boolean
};

export function Button({ children, className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={clsx(
        "flex px-3 py-2 rounded-md justify-center",
        className
      )}
    >
      {children}
    </button>
  );
};


export function PrimaryButton({ className, isLoading, ...props }: ButtonProps) {
  return (
    <Button
      {...props}
      className={clsx(
        "text-white bg-secondary-original hover:bg-secondary-light",
        isLoading ? "animate-pulse" : "",
        className
      )}
    />
  );
};

export function DeleteButton({ className, isLoading, ...props }: ButtonProps) {
  return (
    <Button
      {...props}
      className={clsx(
        "text-rose-500 border-2 border-rose-500 hover:bg-rose-500 hover:text-white",
        isLoading ? "animate-pulse" : "",
        className
      )}
    />
  );
};

interface ErrorMessageProps extends HTMLAttributes<HTMLParagraphElement>{}

export function ErrorMessage({className, ...props}: ErrorMessageProps) {
  return (
    <p {...props} className={`text-xs text-red-500 ${className}`}/>
  );
}

interface PrimaryInputProps extends InputHTMLAttributes<HTMLInputElement>{}

export function PrimaryInput({className, ...props}: PrimaryInputProps) {
  return (
    <input
      {...props}
      className={clsx(
        "w-full border-2 rounded-md p-2 focus:outline-primary",
        className
      )}
    />
  );
};

interface PrimarySelectProps extends SelectHTMLAttributes<HTMLSelectElement>{
  options: Array<{ label: string, value: string }>
}

export function PrimarySelect({className, options, ...props}: PrimarySelectProps) {
  return (
    <select
      {...props}
      className={clsx(
        "w-full py-2 px-1 border-2 rounded-md focus:outline-primary",
        className
      )}
    >
      {options.map(({ label, value }) => <option key={value} value={value}>{label}</option>)}
    </select>
  );
};
