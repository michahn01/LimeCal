import TimeSelector from "./TimeSelector.tsx";
import {
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useParams } from "react-router-dom";
import TimezoneSelect, { type ITimezone } from "react-timezone-select";

import axiosConfig from "../axios.ts";

import "./css/Event.css";

type AvailabilityTableMethods = {
  setAvailableUsers: (times: string[]) => void;
  setUnavailableUsers: (times: string[]) => void;
  setNumUsers: (num: number) => void;
  setInTouchMode: (b: boolean) => void;
};
const AvailabilityTable = forwardRef<AvailabilityTableMethods, {}>((_, ref) => {
  const [available, setAvailable] = useState<string[]>([]);
  const [unavailable, setUnavailable] = useState<string[]>([]);
  const [numUsers, setNumUsers] = useState<number>(0);

  const [inTouchMode, setInTouchMode] = useState<boolean>(false);

  useImperativeHandle(ref, () => ({
    setAvailableUsers: (users: string[]) => {
      setAvailable(users);
    },
    setUnavailableUsers: (users: string[]) => {
      setUnavailable(users);
    },
    setNumUsers: (num: number) => {
      setNumUsers(num);
    },
    setInTouchMode: (b: boolean) => {
      setInTouchMode(b);
    },
  }));

  if (inTouchMode) 
  return (
    <div>
      <div className="availability-table non-super-table" style={{visibility: "hidden"}}>
        <div className="table-header">
          <div className="column-entry">A</div>
          <div className="column-entry">A</div>
        </div>
        <div className="table-body non-super-table-body">
        </div>
      </div>

      <div className="availability-table super-table">
        <div className="table-header">
          <div className="column-entry">Available</div>
          <div className="column-entry">Unavailable</div>
        </div>

        {available.length == 0 && unavailable.length == 0 ? (
          <div className="table-body super-table-body">
            {numUsers == 0 ? (
              <h3>No attendees have responded yet.</h3>
            ) : (
              <h3>Hover over calendar to see who's available.</h3>
            )}
          </div>
        ) : (
          <div className="table-body super-table-body">
            <div className="body-column left-column">
              {available.map((user: string) => {
                return <p key={user}>{user}</p>;
              })}
            </div>
            <div className="body-column">
              {unavailable.map((user: string) => {
                return <p key={user}>{user}</p>;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="availability-table non-super-table">
      <div className="table-header">
        <div className="column-entry">Available</div>
        <div className="column-entry">Unavailable</div>
      </div>

      {available.length == 0 && unavailable.length == 0 ? (
        <div className="table-body non-super-table-body">
          {numUsers == 0 ? (
            <h3>No attendees have responded yet.</h3>
          ) : (
            <h3>Hover over calendar to see who's available.</h3>
          )}
        </div>
      ) : (
        <div className="table-body non-super-table-body">
          <div className="body-column left-column">
            {available.map((user: string) => {
              return <p key={user}>{user}</p>;
            })}
          </div>
          <div className="body-column">
            {unavailable.map((user: string) => {
              return <p key={user}>{user}</p>;
            })}
          </div>
        </div>
      )}
    </div>
  );
});

enum addingMode {
  view = 0,
  enteringName,
  enteringTimes,
}
const Event = () => {
  let { eventId } = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [pageFound, setPageFound] = useState<boolean>(true);
  const [viewWindowRange, setViewWindowRange] = useState<string[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [timezone, setTimezone] = useState<string>("");
  const [selectedTimezone, setSelectedTimezone] =
    useState<ITimezone>("America/Detroit");
  const [eventTitle, setEventTitle] = useState<string>("");

  const [addingAvailability, setAddingAvailability] = useState<addingMode>(
    addingMode.view
  );
  const [userName, setUserName] = useState<string>("");

  const [copyButtonText, setCopyButtonText] = useState<string>("Copy Link");
  const [nameFormInstruction, setNameFormInstruction] = useState<string>(
    "If you're a returning user, sign in with the same name."
  );

  const availabilityTable = useRef<AvailabilityTableMethods>(null);
  useEffect(() => {
    axiosConfig
      .get(`/event/${eventId}`)
      .then((response) => {
        setPageFound(true);
        setLoading(false);
        setViewWindowRange([response.data.start_time, response.data.end_time]);
        setDates(response.data.dates);
        setTimezone(response.data.timezone);
        setSelectedTimezone(response.data.timezone);
        setEventTitle(response.data.title);
      })
      .catch(() => {
        setPageFound(false);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div></div>;
  }
  if (!pageFound) {
    return (
      <div className="centered-box">
        <p
          style={{ color: "whitesmoke", marginTop: "150px", fontSize: "28px" }}
        >
          The page you were looking for cannot be found.
        </p>
      </div>
    );
  }

  return (
    <div className="event-page-body">
      <div className="event-page-container">
        <h1 className="event-title">{eventTitle}</h1>
          <div className="event-page-content">
            <div className="control-panel">
              {addingAvailability === addingMode.enteringName ? (
                <div className="name-form">
                  <form>
                    Enter your name:
                    <input
                      type="text"
                      className="name-input"
                      name="name"
                      onChange={(data) => {
                        setUserName((data.target.value).trim());
                      }}
                    />
                    <div className="button-group">
                      <button
                        type="button"
                        onClick={() => {
                          if (userName.length == 0) {
                            setNameFormInstruction("Please enter a name.");
                            setTimeout(() => {
                              setNameFormInstruction(
                                "If you're a returning user, sign in with the same name."
                              );
                            }, 2500);
                          } else if (userName.length > 150) {
                            setNameFormInstruction(
                              "Name must not exceed 150 characters."
                            );
                            setTimeout(() => {
                              setNameFormInstruction(
                                "If you're a returning user, sign in with the same name."
                              );
                            }, 2500);
                          } else {
                            setAddingAvailability(addingMode.enteringTimes);
                          }
                        }}
                        className="name-field-button continue"
                      >
                        Continue
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAddingAvailability(addingMode.view);
                          setNameFormInstruction(
                            "If you're a returning user, sign in with the same name."
                          );
                        }}
                        className="name-field-button cancel"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="buttons-row">
                  <button
                    className="control-panel-button"
                    onClick={() => {
                      if (addingAvailability === addingMode.view) {
                        setUserName("");
                        setAddingAvailability(addingMode.enteringName);
                      }
                      else setAddingAvailability(addingMode.view);
                    }}
                  >
                    {addingAvailability === addingMode.view
                      ? "Enter Availability"
                      : "Done"}
                  </button>
                  <button
                    className="control-panel-button"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      setCopyButtonText("Copied!");
                      setTimeout(() => {
                        setCopyButtonText("Copy Link");
                      }, 2500);
                    }}
                  >
                    {copyButtonText}
                  </button>
                </div>
              )}
              <p>{nameFormInstruction}</p>
              <div
                style={{
                  opacity:
                    addingAvailability === addingMode.enteringTimes ? "0.2" : "1",
                }}
              >
                <AvailabilityTable ref={availabilityTable}></AvailabilityTable>

                <p>Display timezones in:</p>
                <TimezoneSelect
                  value={selectedTimezone}
                  onChange={(tz: any) => {
                    setSelectedTimezone(tz);
                    setTimezone(tz.value);
                  }}
                  classNamePrefix="selector"
                  styles={{
                    control: (base) => ({
                      ...base,
                      width: "315px",
                    }),
                    menu: (base) => ({
                      ...base,
                    }),
                  }}
                />
              </div>
            </div>
            <TimeSelector
              viewWindowRange={viewWindowRange}
              dates={dates}
              timezone={timezone}
              addingAvailability={addingAvailability === addingMode.enteringTimes}
              userName={userName}
              eventPublicId={eventId ? eventId : ""}
              availabilityTable={availabilityTable}
            ></TimeSelector>
          </div>
      </div>
    </div>
  );
};

export default Event;
