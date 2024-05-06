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

    const handleClick = (timeStamp) => {
        // Your function logic here
        const audioPlayer = document.getElementById("audioPlayer")
        audioPlayer.currentTime = timeStamp

        if (audioPlayer.paused) {
            audioPlayer.play();
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_ES_HOST}/podcasts/_doc/${params.resourceId}`, {
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
                            </tbody>
                        </table>

                        <audio controls preload='metadata' id="audioPlayer" className="audio-player audio">
                            <source src={process.env.REACT_APP_FILE_HOST + "/" + podcastData._source.episode_relative_mp3_path} type="audio/mpeg" />
                        </audio>

                        <h3>Summary</h3>
                        <p dangerouslySetInnerHTML={{__html: podcastData._source.episode_summary}} /> 
                            
                        <h3>Transcript</h3>
                        {podcastData._source.episode_transcript.split('\n').map((line, index) => {
                            const firstTabPosition = line.indexOf("\t");
                            const timeStampSeconds = line.substring(0, firstTabPosition) / 1000;
                            const paragraphText = line.substring(firstTabPosition);

                            return (
                                <div key={index}>
                                    <button type="button" className="btn btn-link .btn-sm m-0 p-0" onClick={() => handleClick(timeStampSeconds)}>Seek to {timeStampSeconds} seconds</button>
                                    <p>{paragraphText}</p>
                                </div>
                            );
                        })}
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
