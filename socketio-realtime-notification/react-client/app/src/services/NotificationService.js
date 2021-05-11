import axios from 'axios';


const NotificationService = {
    
    async create(data) {
        try {
            var notification = {
                title: data.title,
                message: data.message,
                icon: data.icon,
            };
            const url = `${process.env.REACT_APP_NOTIFICATION_HOST}/notifications`;
            const response = await axios.post(url, notification);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

}

export default NotificationService;