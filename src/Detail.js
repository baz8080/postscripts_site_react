import React, { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import Mark from "mark.js";

function DetailPage() {
    const params = useParams();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get('query');

    const [podcastData, setPodcastData] = useState(null);
    const contentRef = useRef(null); // Ref to the content element

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://nasty.local:9200/podcasts/_doc/${params.resourceId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': 'ApiKey ' + process.env.REACT_APP_ES_API_KEY,
                        'Content-Type': 'application/json',
                        'Sec-Fetch-Site': 'cross-site',
                        'Sec-Fetch-Mode': 'cors'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch the podcast');
                }

                const data = await response.json();
                setPodcastData(data);
            } catch (error) {
                console.error('Error fetching podcast data:', error);
            }
        };

        fetchData();
    }, [params.resourceId]);

    useEffect(() => {
        const stopWords = ["the", "of", "and", "to", "in", "a", "for", "on", "with", "at", "by", "from"];

        if (podcastData && query && contentRef.current) {
            const instance = new Mark(contentRef.current);
            instance.unmark(); 

            instance.mark(query, {
                separateWordSearch: false,
                className: "highlight-1",
            });

            const words = query.split(" ");
            words.forEach(word => {
                if (!stopWords.includes(word.toLowerCase())) {
                    instance.mark(word, {
                        separateWordSearch: true,
                        accuracy: "exactly",
                        className: "highlight-2",
                        exclude: ['mark']
                    });
                }
            });

            const firstMarkedElement = document.querySelector(".highlight-1");

            if (firstMarkedElement) {
                firstMarkedElement.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
    }, [podcastData, query]);

    return (
        <article className="mb-4 mt-4">
        <div className="container px-4 px-lg-5">
            {podcastData ? (
                <div className="row gx-4 gx-lg-5 justify-content-center">
                    <div className="col-md-10 col-lg-8 col-xl-7" ref={contentRef} id="episode-transcript">
                        <h2>{podcastData._source.episode_title}</h2>
                        <table className="table">
                            <thead>
                            <tr>
                                <th scope="col">Attribute</th>
                                <th scope="col">Value</th>
                            </tr>    
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Podcast title</td>
                                    <td>{podcastData._source.podcast_title}</td>
                                </tr>
                                <tr>
                                    <td>Published on</td>
                                    <td>{podcastData._source.episode_published_on}</td>
                                </tr>
                                <tr>
                                    <td>Episode link</td>
                                    <td><a href={podcastData._source.episode_web_link}>link</a></td>
                                </tr>
                                <tr>
                                    <td>Audio</td>
                                    <td>
                                        <audio controls preload='none'>
                                            <source src={podcastData._source.episode_audio_link} type="audio/mpeg" />
                                        </audio>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <h3>Summary</h3>
                        <p dangerouslySetInnerHTML={{__html: podcastData._source.episode_summary}} /> 
                            
                        <h3>Transcript</h3>
                        {podcastData._source.episode_transcript.split('\n\n').map((line, index) => (
                            <p key={index}>{line}</p>
                        ))} 
                        
                        
                    </div>    
                </div>
                
            ) : (
                <p>Loading...</p>
            )}
        </div>
        </article>
    );
}

export default DetailPage;
