import React, { useState, useCallback, useRef, useEffect } from "react";
import debounce from "lodash.debounce";
import { Account } from "@/types";
import { useAuth } from "@/context/AuthContext";

interface Props {
  onSelect: (user: Account) => void;
  value?: Account | null;
}

const DebouncedUserDropdown: React.FC<Props> = ({ onSelect, value }) => {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const token = user?.token;

  const hasSelectedRef = useRef(false);

  // Sync external value with internal state
  useEffect(() => {
    if (value) {
      setQuery(value.username); // 👈 Show selected value in input
      setResults([]);
    }
  }, [value]);

  const fetchUsers = useCallback(
    debounce(async (search: string) => {
      if (!search || search.length < 2) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      setLoading(true);
      try {
        const queryStr = encodeURIComponent(search);
        const response = await fetch(
          `/api/v1/user/search?query=${queryStr}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();

        setResults(data);
        setHasSearched(true);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setResults([]);
        setHasSearched(true);
      } finally {
        setLoading(false);
      }
    }, 500),
    [token]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    hasSelectedRef.current = false;
    fetchUsers(value);
  };

  const handleSelect = (user: Account) => {
    setQuery(user.username);
    setResults([]);
    hasSelectedRef.current = true;
    setHasSearched(false);
    onSelect(user);
  };

  if (!user?.username || !token) return null;

  return (
    <div className="relative">
      <input
        type="text"
        className="border p-2 rounded w-full"
        value={query}
        onChange={handleInputChange}
        placeholder="Search recipient..."
      />
      {!loading && hasSearched && results.length === 0 && (
        <div className="text-sm text-gray-500 mt-1">No users found.</div>
      )}
      {results.length > 0 && (
        <ul className="absolute z-30 bg-white border rounded w-full mt-1 max-h-48 overflow-y-auto shadow">
          {results.map((user) => (
            <li
              key={user.id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(user);
              }}
            >
              {user.username} ({user.email})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DebouncedUserDropdown;
