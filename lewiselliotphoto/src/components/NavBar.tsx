import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import './navBar.css'

const NavBar = () => {

    const minScrollToHide = 100;
    const mobileModeWidth = 500;
    const maxNavBarMarginDesktop = 100;
    const maxNavBarMarginMobile = 50;

    const [menuOpen, setMenuOpen] = useState<boolean>(false);
    const [lastScrollPos, setLastScrollPos] = useState<number>(0);
    const [navBarMargin, setNavBarMargin] = useState<number>(0);
    const [scrollStartPos, setScrollStartPos] = useState<number | null>(null);
    const [navBarMarginStart, setNavBarMarginStart] = useState<number | null>(null);
    const [maxNavBarMargin, setMaxNavBarMargin] = useState<number>(100);

    // Hide/show based on scroll state
    useEffect(() => {

        const onScroll = () => {

            const currentScrollPos = window.scrollY;

            // If not currently scrolling the navbar, and now scrolling up, then start scrolling the navbar
            if ((scrollStartPos === null || navBarMarginStart === null) && currentScrollPos > minScrollToHide)
            {
                setScrollStartPos(currentScrollPos);
                setNavBarMarginStart(navBarMargin);
            }

            // Scrolling the navbar
            if (scrollStartPos !== null && navBarMarginStart !== null) {
                let margin = navBarMarginStart + scrollStartPos - currentScrollPos;
                if (margin <= -maxNavBarMargin) {
                    margin = -maxNavBarMargin;
                    setScrollStartPos(null);
                }
                else if (margin >= 0) {
                    margin = 0;
                    setScrollStartPos(null);
                }

                setNavBarMargin(margin);
            }
            
            setLastScrollPos(currentScrollPos);
        };

        window.removeEventListener('scroll', onScroll);
        window.addEventListener('scroll', onScroll, { passive: true });
        
        return () => window.removeEventListener('scroll', onScroll);
    }, [lastScrollPos, scrollStartPos, navBarMarginStart, maxNavBarMargin, navBarMargin]);
    
    // Close nav menu if window is resized to be large
    useEffect(() => {

        const onResize = () => {

            if (window.innerWidth > mobileModeWidth) {
                setMenuOpen(false);
                setMaxNavBarMargin(maxNavBarMarginDesktop);
            }
            else {
                setMaxNavBarMargin(maxNavBarMarginMobile);
            }
        };

        window.removeEventListener('resize', onResize);
        window.addEventListener('resize', onResize, { passive: true });
        
        return () => window.removeEventListener('resize', onResize);

    });


    useEffect(() => {

        if (menuOpen) {
            document.body.classList.add("menuOpen");
        }
        else {
            document.body.classList.remove("menuOpen");
        }

    }, [menuOpen]);


    const links = [
        {
            label: 'HOME',
            to: '/'
        },
        {
            label: 'PORTFOLIO',
            to: '/portfolio'
        },
        {
            label: 'VIDEO',
            to: '/video'
        },
        {
            label: 'CONTACT',
            to: '/contact'
        },
    ];

    return (

        <>
            <nav
                id="navBar"
                style={{
                    marginTop: navBarMargin,
                    zIndex: 999
                }}
            >
                <div
                    id="navBarContainer"
                >
                    <div className="navBarSpacer" />
                    <div
                        id='logo'
                        onClick={() => {setMenuOpen(true)}}
                    >
                    </div>
                    <h1
                        id='title'
                    >
                    </h1>
                    <div className="navBarStretcher" />
                    {
                        links.map(linkData => (
                            <div
                                key={linkData.label}
                                className="navBarLink"
                            >
                                <NavLink
                                    to={linkData.to}
                                    className={({isActive}) => (isActive ? "activePage" : "")}
                                    onClick={() => {setMenuOpen(false)}}
                                >
                                    {linkData.label}
                                </NavLink>
                            </div>
                        ))
                    }
                    <div className="navBarSpacer" />
                </div>
            </nav>
            <div
                id="navMenu"
                className={menuOpen ? "open" : ""}
                style={{
                    zIndex: 1000
                }}
            >
                <div
                    id="navMenuBar"
                >
                    <div className="navBarSpacer" />
                    <div
                        id="navMenuClose"
                        onClick={() => {setMenuOpen(false)}}
                    ></div>
                </div>
                <div className="navBarStretcher" />
                <div
                    id="navMenuContainer"
                >
                    {
                        links.map(linkData => (
                            <div
                                key={linkData.label}
                                className="navMenuLink"
                            >
                                <NavLink
                                    to={linkData.to}
                                    className={({isActive}) => (isActive ? "activePage" : "")}
                                    onClick={() => {setMenuOpen(false)}}
                                >
                                    {linkData.label}
                                </NavLink>
                            </div>
                        ))
                    }
                </div>
                <div className="navBarStretcher" />
            </div>
        </>

    );
};

export default NavBar