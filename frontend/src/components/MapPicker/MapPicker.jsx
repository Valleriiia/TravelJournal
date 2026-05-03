import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-control-geocoder/dist/Control.Geocoder.css'
import * as GeocoderControl from 'leaflet-control-geocoder'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const SearchControl = ({ onSelect }) => {
  const map = useMap()

  useEffect(() => {
    const geocoder = GeocoderControl.geocoder({
      defaultMarkGeocode: false,
      placeholder: 'Пошук місця...',
      errorMessage: 'Нічого не знайдено',
    })

    geocoder.on('markgeocode', (e) => {
      const { center } = e.geocode
      map.setView(center, 15)
      onSelect([center.lng, center.lat])
    })

    geocoder.addTo(map)

    setTimeout(() => {
      const container = geocoder.getContainer()
      if (container) {
        L.DomEvent.disableScrollPropagation(container)
        L.DomEvent.disableClickPropagation(container)

        container.addEventListener('wheel', (e) => e.stopPropagation(), { passive: false })
        container.addEventListener('mousedown', (e) => e.stopPropagation())
      }
    }, 100)

    return () => map.removeControl(geocoder)
  }, [map, onSelect])

  return null
}

const ClickHandler = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      onSelect([e.latlng.lng, e.latlng.lat])
    }
  })
  return null
}

const MapPicker = ({ coordinates, onSelect }) => {
  const position = coordinates
    ? [coordinates[1], coordinates[0]]
    : [48.3794, 31.1656]

  return (
    <MapContainer
      center={position}
      zoom={coordinates ? 13 : 6}
      style={{ height: '280px', width: '100%', borderRadius: '8px' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© OpenStreetMap'
      />
      <SearchControl onSelect={onSelect} />
      <ClickHandler onSelect={onSelect} />
      {coordinates && (
        <Marker position={[coordinates[1], coordinates[0]]} />
      )}
    </MapContainer>
  )
}

export default MapPicker