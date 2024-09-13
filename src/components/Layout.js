import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Offcanvas } from 'react-bootstrap';

const Layout = () => {
  const [show, setShow] = useState(false);
  const [role, setRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userRole = localStorage.getItem('role');
    setRole(userRole);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const toggleDrawer = () => setShow(!show);

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="/">MyApp</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={toggleDrawer} />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {role === 'admin' && <Nav.Link href="/admin-dashboard">Admin Dashboard</Nav.Link>}
              {role === 'student' && <Nav.Link href="/student-dashboard">Student Dashboard</Nav.Link>}
            </Nav>
            <Button variant="outline-light" onClick={handleLogout}>
              Logout
            </Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Offcanvas show={show} onHide={toggleDrawer}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column">
            {role === 'admin' && <Nav.Link href="/admin-dashboard">Admin Dashboard</Nav.Link>}
            {role === 'student' && <Nav.Link href="/student-dashboard">Student Dashboard</Nav.Link>}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>

      <Container className="mt-4">
        <Outlet />
      </Container>
    </>
  );
};

export default Layout;