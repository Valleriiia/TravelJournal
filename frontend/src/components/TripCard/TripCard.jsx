import { useNavigate } from 'react-router-dom'
import './TripCard.scss'

const STATUS_LABELS = {
  planned: 'Заплановано',
  ongoing: 'В процесі',
  completed: 'Завершено',
}

const TripCard = ({ trip, onDelete }) => {
  const navigate = useNavigate()

  const handleDelete = (e) => {
    e.stopPropagation()
    onDelete(trip._id)
  }

  return (
    <div className="trip-card" onClick={() => navigate(`/trips/${trip._id}`)}>
      {trip.coverImage && (
        <img src={trip.coverImage} alt={trip.title} className="trip-card__cover" />
      )}
      <div className="trip-card__header">
        <h3 className="trip-card__title">{trip.title}</h3>
        <span className={`trip-card__status trip-card__status--${trip.status}`}>
          {STATUS_LABELS[trip.status]}
        </span>
      </div>
      {trip.description && (
        <p className="trip-card__desc">{trip.description}</p>
      )}
      <div className="trip-card__footer">
        <span className="trip-card__countries">
          {trip.countries?.join(', ')}
        </span>
        <button className="trip-card__delete" onClick={handleDelete}>Видалити</button>
      </div>
    </div>
  )
}

export default TripCard