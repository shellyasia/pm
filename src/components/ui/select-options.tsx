"use client";

import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOptionItem {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectOptionsProps {
  options: SelectOptionItem[];
  value?: string | string[] | number | number[];
  defaultValue?: string | string[] | number | number[];
  onValueChange?: (value: string | string[] | number | number[]) => void;
  placeholder?: string;
  multiple?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  filterable?: boolean;
  className?: string;
  maxHeight?: number;
  noDataText?: string;
  loadingText?: string;
  loading?: boolean;
}

const SelectOptions = React.forwardRef<HTMLDivElement, SelectOptionsProps>(
  ({
    options = [],
    value,
    defaultValue,
    onValueChange,
    placeholder = "Please select",
    multiple = false,
    disabled = false,
    clearable = false,
    filterable = true,
    className,
    maxHeight = 200,
    noDataText = "No data available",
    loadingText = "Loading...",
    loading = false,
    ...props
  }, ref) => {
    // Helper function to normalize values to strings for consistent comparison
    const normalizeValue = React.useCallback(
      (
        val: string | number | string[] | number[] | undefined,
      ): string | string[] => {
        if (val === undefined) return multiple ? [] : "";
        if (Array.isArray(val)) return val.map((v) => String(v));
        return String(val);
      },
      [multiple],
    );

    const [isOpen, setIsOpen] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState("");
    const [internalValue, setInternalValue] = React.useState<string | string[]>(
      normalizeValue(value ?? defaultValue),
    );
    const [focusedIndex, setFocusedIndex] = React.useState(-1);

    const containerRef = React.useRef<HTMLDivElement>(null);
    const searchInputRef = React.useRef<HTMLInputElement>(null);
    const optionsRef = React.useRef<HTMLDivElement>(null);

    // Sync internal value with external value
    React.useEffect(() => {
      if (value !== undefined) {
        setInternalValue(normalizeValue(value));
      }
    }, [value, normalizeValue]);

    // Filter options based on search
    const filteredOptions = React.useMemo(() => {
      if (!filterable || !searchValue) return options;
      return options.filter((option) =>
        option.label.toLowerCase().includes(searchValue.toLowerCase()) ||
        String(option.value).toLowerCase().includes(searchValue.toLowerCase())
      );
    }, [options, searchValue, filterable]);

    // Get display value
    const displayValue = React.useMemo(() => {
      if (multiple) {
        const selectedOptions = options.filter((option) =>
          Array.isArray(internalValue) &&
          internalValue.includes(String(option.value))
        );
        return selectedOptions.map((option) => option.label).join(", ");
      } else {
        const selectedOption = options.find((option) =>
          String(option.value) === internalValue
        );
        return selectedOption?.label || "";
      }
    }, [internalValue, options, multiple]);

    // Get selected values as array for easier handling
    const selectedValues = React.useMemo(() => {
      return Array.isArray(internalValue)
        ? internalValue
        : [internalValue].filter(Boolean);
    }, [internalValue]);

    const handleValueChange = (newValue: string | string[]) => {
      setInternalValue(newValue);
      onValueChange?.(newValue);
    };

    const handleOptionClick = (optionValue: string | number) => {
      const normalizedOptionValue = String(optionValue);

      if (multiple) {
        const currentValues = Array.isArray(internalValue) ? internalValue : [];
        // Toggle selection: remove if exists, add if not
        if (currentValues.includes(normalizedOptionValue)) {
          const newValues = currentValues.filter((v) =>
            v !== normalizedOptionValue
          );
          handleValueChange(newValues);
        } else {
          // Add only if not already present and ensure uniqueness
          const newValues = Array.from(
            new Set([...currentValues, normalizedOptionValue]),
          );
          handleValueChange(newValues);
        }
      } else {
        handleValueChange(normalizedOptionValue);
        setIsOpen(false);
        setSearchValue("");
      }
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      handleValueChange(multiple ? [] : "");
      setSearchValue("");
    };

    const handleRemoveTag = (
      valueToRemove: string | number,
      e: React.MouseEvent,
    ) => {
      e.stopPropagation();
      const normalizedValue = String(valueToRemove);
      if (Array.isArray(internalValue)) {
        const newValues = internalValue.filter((v) => v !== normalizedValue);
        handleValueChange(newValues);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      switch (e.key) {
        case "Enter":
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else if (
            focusedIndex >= 0 && focusedIndex < filteredOptions.length
          ) {
            handleOptionClick(filteredOptions[focusedIndex].value);
          }
          break;
        case "Escape":
          setIsOpen(false);
          setSearchValue("");
          setFocusedIndex(-1);
          break;
        case "ArrowDown":
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setFocusedIndex((prev) =>
              prev < filteredOptions.length - 1 ? prev + 1 : 0
            );
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          if (isOpen) {
            setFocusedIndex((prev) =>
              prev > 0 ? prev - 1 : filteredOptions.length - 1
            );
          }
          break;
        case "Backspace":
          if (
            multiple && searchValue === "" && Array.isArray(internalValue) &&
            internalValue.length > 0
          ) {
            const newValues = [...internalValue];
            newValues.pop();
            handleValueChange(newValues);
          }
          break;
      }
    };

    // Close dropdown when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
          setSearchValue("");
          setFocusedIndex(-1);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Reset focused index when options change
    React.useEffect(() => {
      setFocusedIndex(-1);
    }, [filteredOptions]);

    // Focus search input when dropdown opens
    React.useEffect(() => {
      if (isOpen && filterable && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isOpen, filterable]);

    const renderSelectedTags = () => {
      if (
        !multiple || !Array.isArray(internalValue) || internalValue.length === 0
      ) {
        return null;
      }

      return internalValue.map((val) => {
        // Find the corresponding option to display its label, comparing as strings
        const option = options.find((opt) => String(opt.value) === String(val));
        const displayText = option?.label || val;

        return (
          <span
            key={val}
            className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-1 text-xs text-secondary-foreground"
          >
            <span>{displayText}</span>
            <button
              type="button"
              onClick={(e) => handleRemoveTag(val, e)}
              className="hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        );
      });
    };

    return (
      <div ref={containerRef} className={cn("relative", className)} {...props}>
        <div
          ref={ref}
          className={cn(
            "flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer",
            disabled && "cursor-not-allowed opacity-50",
            className,
          )}
          onClick={() =>
            !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
        >
          <div className="flex flex-1 flex-wrap items-center gap-1">
            {multiple
              ? (
                <>
                  {renderSelectedTags()}
                  {filterable && isOpen && (
                    <input
                      ref={searchInputRef}
                      type="text"
                      className="flex-1 min-w-[120px] bg-transparent outline-none placeholder:text-muted-foreground"
                      placeholder={selectedValues.length === 0
                        ? placeholder
                        : ""}
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  {!isOpen && selectedValues.length === 0 && (
                    <span className="text-muted-foreground">{placeholder}</span>
                  )}
                </>
              )
              : (
                <>
                  {filterable && isOpen
                    ? (
                      <input
                        ref={searchInputRef}
                        type="text"
                        className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                        placeholder={placeholder}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )
                    : (
                      <span
                        className={cn(
                          "flex-1",
                          displayValue
                            ? "text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {displayValue || placeholder}
                      </span>
                    )}
                </>
              )}
          </div>

          <div className="flex items-center gap-1">
            {clearable && (selectedValues.length > 0) && (
              <button
                type="button"
                onClick={handleClear}
                className="flex h-4 w-4 items-center justify-center rounded hover:bg-accent"
              >
                <X className="h-3 w-3" />
              </button>
            )}
            <ChevronDown
              className={cn(
                "h-4 w-4 opacity-50 transition-transform",
                isOpen && "rotate-180",
              )}
            />
          </div>
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 z-50 w-full mt-1">
            <div
              className={cn(
                "rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
                "data-[side=bottom]:slide-in-from-top-2",
              )}
            >
              <div
                ref={optionsRef}
                className="p-1 overflow-auto"
                style={{ maxHeight }}
              >
                {loading
                  ? (
                    <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                      {loadingText}
                    </div>
                  )
                  : filteredOptions.length === 0
                  ? (
                    <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                      {noDataText}
                    </div>
                  )
                  : (
                    filteredOptions.map((option, index) => {
                      const isSelected = selectedValues.includes(
                        String(option.value),
                      );
                      const isFocused = index === focusedIndex;

                      return (
                        <div
                          key={option.value}
                          className={cn(
                            "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors",
                            isFocused && "bg-accent text-accent-foreground",
                            !isFocused && "hover:bg-accent/50",
                            option.disabled && "pointer-events-none opacity-50",
                            isSelected && "bg-accent/20",
                          )}
                          onClick={() =>
                            !option.disabled && handleOptionClick(option.value)}
                        >
                          <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                            {isSelected && <Check className="h-4 w-4" />}
                          </span>
                          <span>{option.label}</span>
                        </div>
                      );
                    })
                  )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);

SelectOptions.displayName = "SelectOptions";

export { SelectOptions };
