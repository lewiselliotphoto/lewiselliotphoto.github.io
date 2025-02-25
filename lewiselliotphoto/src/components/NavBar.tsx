import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import './navBar.css'

const NavBar = () => {

    const [menuOpen, setMenuOpen] = useState<boolean>(false);
    const [hidden, setHidden] = useState<boolean>(false);
    const [lastScrollPos, setLastScrollPos] = useState<number>(0);

    const minScrollToHide = 100;
    const minScrollDeltaToTriggerShow = 2;
    const minScrollDeltaToTriggerHide = 5;

    const mobileModeWidth = 500;

    // Hide/show based on scroll state
    useEffect(() => {

        const onScroll = () => {

            const currentScrollPos = window.scrollY;

            if (currentScrollPos < minScrollToHide)
            {
                setHidden(false);
            }
            else
            {
                const shouldHide = (lastScrollPos < currentScrollPos);
                const scrollDelta = Math.abs(lastScrollPos - currentScrollPos);
                
                if (shouldHide && scrollDelta > minScrollDeltaToTriggerHide) {
                    setHidden(true);
                }
                else if (!shouldHide && scrollDelta > minScrollDeltaToTriggerShow) {
                    setHidden(false);
                }
            }
            
            setLastScrollPos(currentScrollPos);
        };

        window.removeEventListener('scroll', onScroll);
        window.addEventListener('scroll', onScroll, { passive: true });
        
        return () => window.removeEventListener('scroll', onScroll);
    }, [lastScrollPos]);
    
    // Close nav menu if window is resized to be large
    useEffect(() => {

        const onResize = () => {
            if (window.innerWidth > mobileModeWidth) {
                setMenuOpen(false);
            }
        };

        window.removeEventListener('resize', onResize);
        window.addEventListener('resize', onResize, { passive: true });
        
        return () => window.removeEventListener('resize', onResize);

    });


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
                className={hidden ? "hidden" : ""}
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