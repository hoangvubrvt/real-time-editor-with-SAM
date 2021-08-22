import React from 'react';
import { Navbar, NavbarBrand } from 'reactstrap';

const Header = () => (
  <Navbar color="light" light>
    <NavbarBrand href="/">Real-time document editor</NavbarBrand>
  </Navbar>
);

export default Header;
