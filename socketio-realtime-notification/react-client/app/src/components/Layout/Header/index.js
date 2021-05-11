import React from 'react';
import logo from 'src/logo.svg';
import './header.css'; 

function Header(props) {

  let { notifications } = props
  
  return (
    <header>
      <nav id="main-nav" className="navbar navbar-expand-lg navbar-light px-3 py-0">
        <div className="container-fluid">
          <a className="navbar-brand p" href="/">
            <img src={logo} alt="" width={30} height={24} className="d-inline-block align-text-top" />
          </a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="navbarText">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-link active" aria-current="page" href="/">React Client</a>
              </li>
            </ul>
            <span className="navbar-text">
              <div id="header-notification">
                <span className="icon dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" className="bi bi-bell" viewBox="0 0 16 16">
                    <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z" />
                  </svg>
                  <i className="count-unread" data-count={notifications.length}>{notifications.length}</i>
                </span>
                <ul className="notifications dropdown-menu show">
                {notifications.map((item, index) => (
                    <li key={index}>
                      <span className="image">
                        <img className="img-thumbnail rounded-circle" src={logo} alt="" />
                      </span>
                      <span className="title">{item.title}</span>
                      <span className="message">{item.message}</span>
                    </li>
                ))}
                </ul>
              </div>
            </span>
          </div>
        </div>
      </nav>
    </header>

  );
}

export default Header;