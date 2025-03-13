import { useEffect, useState } from 'react';

import contactDetails from '../content/contact.json';

import "./footer.css"

const Footer = () => {

    const copyIndicatorCloseTimeMS = 3000;

    const [copiedText, setCopiedText] = useState<string>('');
    const [copyIndicatorOpen, setCopyIndicatorOpen] = useState<boolean>(false);

    useEffect(() => {
        if (copyIndicatorOpen) {
            const closer = window.setTimeout(() => {
                setCopyIndicatorOpen(false);
            }, copyIndicatorCloseTimeMS)
        
            return () => {window.clearTimeout(closer)};
        }
    }, [copyIndicatorOpen]);

    const copyToClipboard = (content: string) => {
        navigator.clipboard.writeText(content);
        setCopiedText(content);
        setCopyIndicatorOpen(true);
    };

    return (
        <div
            className='contactDetailsFooter'
        >
            <div
                onClick={() => copyToClipboard(contactDetails.email)}
                className='emailCopier'
            >
                {contactDetails.email}
            </div>
            <a
                href={`https://instagram.com/${contactDetails.instagram}`}
                target="_blank"
                rel="noreferrer"
            >
                <div
                    className='instagram'
                >
                    <div
                        className='instagramLogo'
                    />
                    @{contactDetails.instagram}
                </div>
            </a>
            <div
                className='copyright'
            >
                &copy;
                {(() => {
                    const year = (new Date()).getFullYear();
                    const startYear = 2025;
                    return year === startYear ? ` ${year} ` : ` ${startYear} - ${year} `;
                })()}
                Lewis Elliot McWilliam Smith
                <br/>
                <sup>
                    All rights reserved.
                </sup>
            </div>
            <div
                className='copiedTextIndicator'
                style={{
                    top: copyIndicatorOpen ? '0px' : '-100px'
                }}
            >
                Copied {copiedText}
            </div>
        </div>
    );
};

export default Footer;
