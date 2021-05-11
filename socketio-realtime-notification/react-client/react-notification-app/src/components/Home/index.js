import React from 'react';

function Home(props) {
  
  return (
    <div className="container py-3">
        <div className="row">
        <div className="col-md-6 offset-md-3">
            <form method="POST">
            <p>
                <input className="form-control" name="title" defaultValue="Welcome React Client" required />
            </p>
            <p>
                <input className="form-control" name="message" defaultValue="We will play around with SocketIO" required />
            </p>
            <p>
                <input className="form-control" name="icon" defaultValue="/static/assets/images/user-avatar.png" required />
            </p>
            <button type="submit" className="btn btn-primary">
                Send Notification via Rest API
            </button>
            </form>
        </div>
        </div>
    </div>
  );
}

export default Home;