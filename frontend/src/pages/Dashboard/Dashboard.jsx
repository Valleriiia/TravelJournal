import { useState, useEffect } from "react";
import { useAuth } from '../../context/authContext';
import { getTrips, createTrip, deleteTrip } from "../../api/trips";
import TripCard from "../../components/TripCard/TripCard";
import { uploadFile } from "../../api/upload";
import "./Dashboard.scss";

const EMPTY_FORM = {
  title: "",
  description: "",
  countries: "",
  startDate: "",
  endDate: "",
  status: "planned",
  budget: { amount: "", currency: "UAH" },
  isPublic: false,
};

const Dashboard = () => {
  const { user } = useAuth()
  const [trips, setTrips] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [tripSaving, setTripSaving] = useState(false)
  const [tripError, setTripError] = useState('')

  useEffect(() => {
    getTrips()
      .then(setTrips)
      .finally(() => setLoading(false));
  }, []);

  const getAutoStatus = (startDate, endDate) => {
    if (!startDate) return "planned";
    const now = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    if (start > now) return "planned";
    if (end && end < now) return "completed";
    return "ongoing";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "amount" || name === "currency") {
      setForm((f) => ({ ...f, budget: { ...f.budget, [name]: value } }));
    } else {
      setForm((f) => {
        const updated = { ...f, [name]: value };
        // автоматично оновлюємо статус при зміні дат
        if (name === "startDate" || name === "endDate") {
          updated.status = getAutoStatus(
            name === "startDate" ? value : f.startDate,
            name === "endDate" ? value : f.endDate,
          );
        }
        return updated;
      });
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleRemoveCover = () => {
    setCoverFile(null)
    setCoverPreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTripSaving(true);
    setTripError('');
    try {
      let coverImage = "";
      if (coverFile) {
        const res = await uploadFile(coverFile);
        coverImage = res.url;
      }
      const data = {
        ...form,
        coverImage,
        countries: form.countries
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        budget: {
          amount: Number(form.budget.amount),
          currency: form.budget.currency,
        },
      };
      const newTrip = await createTrip(data);
      setTrips((prev) => [newTrip, ...prev]);
      setForm(EMPTY_FORM);
      setCoverFile(null);
      setCoverPreview(null);
      setShowForm(false);
    } catch (err) {
      setTripError(err.message || 'Помилка збереження. Спробуй ще раз.');
    } finally {
      setTripSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Видалити поїздку?")) return;
    await deleteTrip(id);
    setTrips((prev) => prev.filter((t) => t._id !== id));
  };

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1>Мої подорожі</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="btn-primary"
        >
          {showForm ? "Скасувати" : "+ Нова поїздка"}
        </button>
      </div>

      {showForm && (
        <form className="trip-form" onSubmit={handleSubmit}>
          <h2>Нова поїздка</h2>

          <div className="trip-form__grid">
            <input
              name="title"
              placeholder="Назва *"
              value={form.title}
              onChange={handleChange}
              required
            />
            <input
              name="countries"
              placeholder="Країни (через кому)"
              value={form.countries}
              onChange={handleChange}
            />
          </div>

          <div className="trip-form__grid">
            <div className="trip-form__field">
              <label>Дата початку</label>
              <input
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={handleChange}
                max={form.endDate || undefined}
              />
            </div>
            <div className="trip-form__field">
              <label>Дата закінчення</label>
              <input
                name="endDate"
                type="date"
                value={form.endDate}
                onChange={handleChange}
                min={form.startDate || undefined}
              />
            </div>
          </div>

          <div className="trip-form__grid">
            <div className="trip-form__field">
              <label>
                Статус{" "}
                {form.startDate && (
                  <span className="trip-form__auto">
                    (визначається автоматично)
                  </span>
                )}
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                disabled={!!form.startDate}
              >
                <option value="planned">Заплановано</option>
                <option value="ongoing">В процесі</option>
                <option value="completed">Завершено</option>
              </select>
            </div>
            <div className="trip-form__field">
              <label></label>
              <div className="trip-form__budget">
                <input
                  name="amount"
                  type="number"
                  placeholder="Бюджет"
                  value={form.budget.amount}
                  onChange={handleChange}
                />
                <select
                  name="currency"
                  value={form.budget.currency}
                  onChange={handleChange}
                >
                  <option value="UAH">UAH</option>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
          </div>

          <textarea
            name="description"
            placeholder="Опис"
            value={form.description}
            onChange={handleChange}
            rows={3}
          />
          <div className="trip-form__field">
            <label>Обкладинка</label>
            {coverPreview && (
              <div className="trip-form__cover-preview">
                <img
                  src={coverPreview}
                  alt="cover"
                />
                <button
                  type="button"
                  className="trip-form__remove-photo"
                  onClick={() => handleRemoveCover()}
                >×</button>
              </div>

            )}
            <label className="trip-form__file-btn">
              {coverFile ? coverFile.name : "Обрати фото"}
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                hidden
              />
            </label>
          </div>
          {user?.isPublicProfile && (<label className="trip-form__checkbox">
            <input
              type="checkbox"
              name="isPublic"
              checked={form.isPublic}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  isPublic: e.target.checked,
                }))
              }
            />
            Публічна поїздка
          </label>)}
          {tripError && <p className="trip-form__error">{tripError}</p>}
          <button type="submit" className="btn-primary" disabled={tripSaving}>
            {tripSaving ? (
              <span className="trip-form__spinner">
                <span className="spinner" /> Збереження...
              </span>
            ) : 'Створити'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="dashboard__loading">Завантаження...</p>
      ) : trips.length === 0 ? (
        <p className="dashboard__empty">
          Поїздок ще немає. Додай першу! ✈️
        </p>
      ) : (
        <div className="dashboard__grid">
          {trips.map((trip) => (
            <TripCard
              key={trip._id}
              trip={trip}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
