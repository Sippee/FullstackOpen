import './Notification.css'

const Notification = ({ message, type = 'success' }) => {
	if (!message) {
		return null
	}

	return <div className={type}>{message}</div>
}

export default Notification
