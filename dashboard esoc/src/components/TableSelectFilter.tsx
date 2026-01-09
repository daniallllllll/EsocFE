type Option = {
  label: string;
  value: string;
};

interface Props {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  placeholder: string;
}

export function TableSelectFilter({
  value,
  options,
  onChange,
  placeholder,
}: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="
        w-full
        px-2 py-1
        text-sm
        border border-gray-300
        rounded-md
        bg-white
        focus:outline-none
        focus:ring-1 focus:ring-blue-500
      "
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
