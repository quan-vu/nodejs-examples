import React from "react";
import NotificationService from 'src/services/NotificationService';


function Home() {

    let defaultTitle = 'ReactJS';
    let defaultMessage = 'Sent from React Client';
    let defaultIcon = '/static/assets/images/user-avatar.png';

    const [title, setTitle] = React.useState(defaultTitle);
    const [message, setMessage] = React.useState(defaultMessage);
    const [icon, setIcon] = React.useState(defaultIcon);

    const onChangeTitle = (event) => {
        setTitle(event.target.value);
        console.log(title);
    }

    const onChangeMessage = (event) => {
        setMessage(event.target.value);
        console.log(message);
    }

    const onChangeIcon = (event) => {
        setIcon(event.target.value);
        console.log(icon);
    }

    const onSubmitFrom = (event) => {
        event.preventDefault();

        const data = {
            title: title,
            message: message,
            icon: icon,
        }

        const response = NotificationService.create(data).then(data => {
                console.log(data); // JSON data parsed by `data.json()` call
                return data;
            });
        console.log(response);
    }

  return (
    <div className="container py-3">
      <div className="row">
        <div className="col-md-6 offset-md-3">
          <form onSubmit={onSubmitFrom}>
            <p>
              <input
                className="form-control"
                name="title"
                value={title}
                required
                onChange={onChangeTitle}
              />
            </p>
            <p>
              <input
                className="form-control"
                name="message"
                value={message}
                required
                onChange={onChangeMessage}
              />
            </p>
            <p>
              <input
                className="form-control"
                name="icon"
                value={icon}
                required
                onChange={onChangeIcon}
              />
            </p>
            <button type="submit" className="btn btn-primary">
              Send Notification via Rest API
            </button>
          </form>

          <div>
                <p>Title: {title}</p>
                <p>Message: {message}</p>
                <p>Title: {icon}</p>
                
            </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
