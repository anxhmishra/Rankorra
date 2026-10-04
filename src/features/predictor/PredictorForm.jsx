import { useState } from 'react';
import { CATEGORIES, GENDERS, QUOTAS, BRANCHES } from './constants';

const init = {
  mains_rank: '',
  advanced_rank: '',
  category: 'OPEN',
  gender: 'Gender-Neutral',
  preferred_branch: '',
  quota: 'AI',
};

export default function PredictorForm({ onSubmit, loading }) {
  const [f, setF] = useState(init);
  const [err, setErr] = useState('');

  const setField = (key, value) => {
    setF((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (err) {
      setErr('');
    }
  };

  function submit(e) {
    e.preventDefault();

    const mains_rank = Number(f.mains_rank);

    const advanced_rank =
      f.advanced_rank.trim() === ''
        ? null
        : Number(f.advanced_rank);

    // Mains rank is mandatory
    if (!Number.isInteger(mains_rank) || mains_rank < 1) {
      setErr(
        'Enter your JEE Mains rank as a whole number, 1 or higher.'
      );
      return;
    }

    // Advanced rank is optional
    // If provided, it must be a positive whole number
    if (
      advanced_rank !== null &&
      (!Number.isInteger(advanced_rank) || advanced_rank < 1)
    ) {
      setErr(
        'Enter a valid JEE Advanced rank as a whole number.'
      );
      return;
    }

    // Preferred branch
    if (f.preferred_branch.trim().length < 2) {
      setErr('Enter or choose a preferred branch.');
      return;
    }

    setErr('');

    onSubmit({
      ...f,
      mains_rank,
      advanced_rank,
      preferred_branch: f.preferred_branch.trim(),
    });
  }

  return (
    <form onSubmit={submit} className="predictor-form">

      {/* JEE Mains Rank */}
      <div className="form-group">
        <label htmlFor="mains_rank">
          JEE Mains Rank
        </label>

        <input
          id="mains_rank"
          type="number"
          min="1"
          step="1"
          value={f.mains_rank}
          onChange={(e) =>
            setField('mains_rank', e.target.value)
          }
          placeholder="e.g. 8500"
          required
        />
      </div>

      {/* JEE Advanced Rank */}
      <div className="form-group">
        <label htmlFor="advanced_rank">
          JEE Advanced Rank
          <span className="optional"> (Optional)</span>
        </label>

        <input
          id="advanced_rank"
          type="number"
          min="1"
          step="1"
          value={f.advanced_rank}
          onChange={(e) =>
            setField('advanced_rank', e.target.value)
          }
          placeholder="e.g. 777 (leave blank if N/A)"
        />

        <small>
          Leave blank if you did not appear for JEE Advanced.
          IITs will be excluded automatically.
        </small>
      </div>

      {/* Category */}
      <div className="form-group">
        <label htmlFor="category">
          Category
        </label>

        <select
          id="category"
          value={f.category}
          onChange={(e) =>
            setField('category', e.target.value)
          }
        >
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Gender */}
      <div className="form-group">
        <label htmlFor="gender">
          Gender
        </label>

        <select
          id="gender"
          value={f.gender}
          onChange={(e) =>
            setField('gender', e.target.value)
          }
        >
          {GENDERS.map((gender) => (
            <option key={gender} value={gender}>
              {gender}
            </option>
          ))}
        </select>
      </div>

      {/* Quota */}
      <div className="form-group">
        <label htmlFor="quota">
          Quota
        </label>

        <select
          id="quota"
          value={f.quota}
          onChange={(e) =>
            setField('quota', e.target.value)
          }
        >
          {QUOTAS.map((quota) => (
            <option key={quota} value={quota}>
              {quota}
            </option>
          ))}
        </select>
      </div>

      {/* Preferred Branch */}
      <div className="form-group">
        <label htmlFor="preferred_branch">
          Preferred Branch
        </label>

        <select
          id="preferred_branch"
          value={f.preferred_branch}
          onChange={(e) =>
            setField('preferred_branch', e.target.value)
          }
          required
        >
          <option value="">
            Select a branch
          </option>

          {BRANCHES.map((branch) => (
            <option key={branch} value={branch}>
              {branch}
            </option>
          ))}
        </select>
      </div>

      {/* Error */}
      {err && (
        <div className="form-error" role="alert">
          {err}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="submit-button"
      >
        {loading
          ? 'Finding seats…'
          : 'Find my colleges'}
      </button>

    </form>
  );
}