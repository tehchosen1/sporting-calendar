import React from "react";
import "./EditableText.css";

type EditableTextVariant =
  | "league"
  | "date"
  | "stadium"
  | "sandwiched"
  | "contentEditable";

interface EditableTextProps {
  value: string;
  onChange?: (value: string) => void;
  variant: EditableTextVariant;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
}

const EditableText: React.FC<EditableTextProps> = ({
  value,
  onChange,
  variant,
  readOnly = false,
  placeholder = "",
  className = "",
}) => {
  if (variant === "contentEditable") {
    return (
      <div
        className={`centered-text ${className}`}
        contentEditable={!readOnly}
        suppressContentEditableWarning={true}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    );
  }

  if (variant === "sandwiched") {
    return (
      <div
        className={`sandwiched-text ${className}`}
        contentEditable={!readOnly}
        suppressContentEditableWarning={true}
      >
        {value}
      </div>
    );
  }

  return (
    <input
      spellCheck={false}
      type="text"
      className={`editable-text ${variant}-text ${className}`}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      readOnly={readOnly}
      placeholder={placeholder}
    />
  );
};

export default EditableText;
