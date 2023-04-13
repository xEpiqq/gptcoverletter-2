"use client";
import React from "react";
import s from "./dashboard.module.scss";
import { useState, useEffect } from "react";
import { signOut, getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import * as pdfjsLib from "pdfjs-dist/webpack";
import app from "../../components/FirebaseApp";
import useSWR from "swr";
import Link from "next/link";
import UpgradePopup from "@/components/UpgradePopup";

import axios from "axios";

// TODO: ask before regenerating cover letter
// TODO: fix input on left

export default function Dashboard() {
  const router = useRouter();
  const auth = getAuth();
  const [user, loadingUser, error] = useAuthState(auth);

  // fetch user data from firestore
  const { data = {subscription_status: "none"}, swrerror, swrisLoading } = useSWR(
    "/api/firestoreUserData",
    (url) => {
      return fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid }),
      }).then((res) => res.json());
    }
  );

  const [openLetter, setOpenLetter] = useState(0);
  const [coverLetterOptions, setCoverLetterOptions] = useState([
    {
      title: "My First Cover Letter",
      content: "This is my first cover letter",
    },
    {
      title: "My Second Cover Letter",
      content: "This is my second cover letter",
    },
    {
      title: "My Third Cover Letter",
      content: "This is my third cover letter",
    },
  ]);

  const [jobTitle, setJobTitle] = useState("");
  const [jobCompany, setJobCompany] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [resumePdf, setResumePdf] = useState(undefined);
  const [creativityMeter, setCreativityMeter] = useState(50);
  const [letterText, setLetterText] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [letterNameEdit, setLetterNameEdit] = useState(-1);
  const [upgrade_popup, setUpgradePopup] = useState(false);

  const [letterTextFlag, setLetterTextFlag] = useState(false);

  const uploadResume = (e) => {};

  useEffect(() => {
    if (!user) return;

    axios.get("/api/letters/usersLetters?id=" + user.uid).then((res) => {
      setCoverLetterOptions(res.data);
    });
  }, [user]);

  const saveCoverLetter = (e) => {
    if (!letterTextFlag) {
      return;
    }
    if (coverLetterOptions[openLetter].id === undefined) {
      return;
    }
    if (coverLetterOptions[openLetter].contents === "") {
      return;
    }
    setLetterTextFlag(false);
    axios.post(
      "/api/letters/letter",
      {
        user_uid: user.uid,
        letter_uid: coverLetterOptions[openLetter].id,
        letter_title: coverLetterOptions[openLetter].title,
        letter_contents: coverLetterOptions[openLetter].contents,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  };

  const createCoverLetter = (e) => {
    axios.put(
      "/api/letters/letter",
      {
        user_uid: user.uid,
        letter_title: "New Cover Letter",
        letter_contents: "This is a new cover letter",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    setCoverLetterOptions([
      ...coverLetterOptions,
      { title: "New Cover Letter", content: "This is a new cover letter" },
    ]);
  };

  const fileUploaded = (e) => {
    // get the text content of the pdf
    const reader = new FileReader();
    let allText = "";
    reader.onload = function (e) {
      const typedarray = new Uint8Array(e.target.result);
      pdfjsLib.getDocument(typedarray).promise.then(function (pdf) {
        // put all pages text in a single string
        for (let i = 0; i < pdf.numPages; i++) {
          pdf.getPage(i + 1).then(function (page) {
            page.getTextContent().then(function (textContent) {
              const textItems = textContent.items;
              const finalString = textItems
                .map(function (item) {
                  return item.str;
                })
                .join(" ");
              allText += finalString;
              // print if it is the last page
              if (i === pdf.numPages - 1) {
                setResumePdf(allText.replace(/\s+/g, " ").trim());
              }
            });
          });
        }
      });
    };
    reader.readAsArrayBuffer(e.target.files[0]);
  };

  const handleSidebar = (e) => {
    setSidebarOpen(!sidebarOpen);
  };

  const renameLetter = (e) => {
    setLetterNameEdit(e);
  };

  const deleteLetter = (index) => {
    axios.delete("/api/letters/letter", {
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        user_uid: user.uid,
        letter_uid: coverLetterOptions[index].id,
      },
    });

    if (openLetter === index) {
      setOpenLetter(0);
    }
    const newCoverLetterOptions = [...coverLetterOptions];
    newCoverLetterOptions.splice(index, 1);
    setCoverLetterOptions(newCoverLetterOptions);
  };

  const generateCoverLetter = async (e) => {
    if (loading) return;

    setLoading(true);

    const apidata = {
      jobTitle,
      jobCompany,
      jobLocation,
      jobDescription,
      additionalInstructions,
      resumePdf,
      creativityMeter,
      user_id: user.uid,
    };

    console.log("subscription status", data.subscription_status);
    const trial = data.subscription_status != "active";
    console.log("trial", trial);
    const url = trial
      ? "/api/createCoverLetterSample"
      : "/api/createCoverLetter";
    console.log("url", url);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apidata),
    });

    const json = await res.json();

    console.log(json);
    setLetterText(json.data);
    // update the current cover letter
    coverLetterOptions[openLetter].contents = json.data;
    // and title
    coverLetterOptions[openLetter].title = jobCompany;
    setLetterTextFlag(true);
    setLoading(false);

    if (!res.ok) throw Error(json.message);
  };

  if (loadingUser || swrisLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    router.push("/signin");
  }

  return (
    <div className={s.page}>
      {upgrade_popup && (
          <UpgradePopup
            closePopup={() => setUpgradePopup(false)}
          />
      )}
      <div className={s.navbar}>
        <div className={s.navbar_left}>
          <img className={s.logo} src="/logo_blue.svg" alt="logo" />
          {sidebarOpen && (
            <button
              onClick={handleSidebar}
              id="navbarToggler"
              aria-label="Mobile Menu"
              className="absolute right-4 top-1/2 block translate-y-[-50%] rounded-lg px-3 py-[6px] ring-primary focus:ring-2 lg:hidden"
            >
              <span
                className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300 dark:bg-white ${
                  sidebarOpen ? " top-[7px] rotate-45" : " "
                }`}
              />
              <span
                className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300 dark:bg-white ${
                  sidebarOpen ? "opacity-0 " : " "
                }`}
              />
              <span
                className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300 dark:bg-white ${
                  sidebarOpen ? " top-[-8px] -rotate-45" : " "
                }`}
              />
            </button>
          )}
        </div>
        <div className={s.navbar_center}>
          <img src="/double_arrow_left.svg" alt="logo" />
          <h1>COVER LETTER GENERATOR</h1>
          <img src="/double_arrow_right.svg" alt="logo" />
        </div>
        <div className={s.navbar_right}>
          <h3>Welcome {user.displayName}!</h3>
          <img src={user.photoURL} alt="logo" />
        </div>
      </div>
      <div className={upgrade_popup ? s.content_disable: s.content}>
        <div
          className={sidebarOpen ? s.content_left_open : s.content_left_closed}
        >
          <div className={s.content_left_top}>
            {sidebarOpen && (
              <button onClick={handleSidebar}>{"< Close"}</button>
            )}
            <button onClick={(e) => createCoverLetter(e)}>
              {"+ New Cover Letter"}
            </button>
          </div>
          <div className={s.content_left_middle}>
            <div className={s.cover_letter_selector_container}>
              {coverLetterOptions.map((coverLetterOption, index) => {
                return (
                  <div
                    className={s.cover_letter_selector_button}
                    style={index === openLetter ? {backgroundColor: "#d3d3d3"} : {}}
                    key={`coverLetterOption-${index}`}
                  >
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: "1rem",
                      }}
                      onClick={(e) => {
                        saveCoverLetter(e);
                        setOpenLetter(index);
                        setLetterText(coverLetterOption.contents);
                      }}
                    >
                      <img src="/cover_letter_button_icon.svg" alt="logo" />
                      {letterNameEdit === index ? (
                        <input
                          type="text"
                          value={coverLetterOption.title}
                          onChange={(e) => {
                            setLetterTextFlag(true);
                            const newCoverLetterOptions = [
                              ...coverLetterOptions,
                            ];
                            newCoverLetterOptions[index].title = e.target.value;
                            setCoverLetterOptions(newCoverLetterOptions);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              setLetterNameEdit(-1);
                              saveCoverLetter(index);
                            }
                          }}
                          onBlur={() =>
                            setLetterNameEdit(-1) || saveCoverLetter(index)
                          }
                          blurOnSubmit={true}
                        />
                      ) : (
                        <p>{coverLetterOption.title}</p>
                      )}
                    </div>
                    {letterNameEdit === -1 && (
                      <div
                        className={s.cover_letter_selector_button_right_icons}
                      >
                        <img
                          src="/trash_icon.svg"
                          alt="logo"
                          onClick={() => deleteLetter(index)}
                        />
                        <img
                          src="/edit_icon.svg"
                          alt="logo"
                          onClick={() => renameLetter(index)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className={s.content_left_bottom}>
            <div className={s.container}>
              <hr />
              <Link className={s.subscription_button} href={"/account"}>
                <img src="/subscription_icon.svg" alt="logo" />
                Account
              </Link>
              <Link className={s.logout_button} href={"/"}>
                <img src="/home_icon.svg" alt="logo" />
                Home
              </Link>
              <Link
                className={s.logout_button}
                onClick={() => {
                  signOut(auth);
                  router.push("/");
                }}
                href={"/"}
              >
                <img src="/logout_icon.svg" alt="logo" />
                Logout
              </Link>
            </div>
          </div>
        </div>
        <div className={s.content_center}>
          <div className={s.content_center_textbox}>
            <textarea
              type="text"
              placeholder=""
              value={coverLetterOptions[openLetter] ? coverLetterOptions[openLetter].contents: ""}
              onChange={(e) => {
                setLetterTextFlag(true);
                setCoverLetterOptions(
                  coverLetterOptions.map((coverLetterOption, index) => {
                    if (index === openLetter) {
                      return {
                        ...coverLetterOption,
                        contents: e.target.value,
                      };
                    } else {
                      return coverLetterOption;
                    }
                  })
                );
              }}
              onBlur={(e) => saveCoverLetter(e)}
            />
          </div>
        </div>
        <div className={s.content_right}>
          <div className={s.input_container}>
            <label htmlFor="Job input">Job Title</label>
            <input
              onChange={(e) => setJobTitle(e.target.value)}
              value={jobTitle}
              id="Job input"
              className={s.content_right_input}
            />
          </div>
          <div className={s.input_container}>
            <label htmlFor="Company input">Company</label>
            <input
              onChange={(e) => setJobCompany(e.target.value)}
              value={jobCompany}
              id="Company input"
              className={s.content_right_input}
            />
          </div>
          <div className={s.input_container}>
            <label htmlFor="Location input">Location</label>
            <input
              onChange={(e) => setJobLocation(e.target.value)}
              value={jobLocation}
              id="Location input"
              className={s.content_right_input}
            />
          </div>

          <div className={s.input_container}>
            <label htmlFor="Additional Instructions">
              Additional instructions here
            </label>
            <input
              type="text"
              id="Additional Instructions"
              value={additionalInstructions}
              onChange={(e) => setAdditionalInstructions(e.target.value)}
              className={s.content_right_input}
            />
          </div>
          <div className={s.input_container_big}>
            <label id="Job Description input">
              Paste the job description here
            </label>
            <textarea
              onChange={(e) => setJobDescription(e.target.value)}
              value={jobDescription}
              id="Job Description input"
              className={s.content_right_input_textbox}
            />
          </div>
          <div className={s.input_container}>
            <label htmlFor="Creativity input">
              The creativity meter: {creativityMeter}
            </label>

            <input
              type="range"
              className={s.slider}
              min="1"
              max="100"
              value={creativityMeter}
              id="Creativity input"
              onChange={(e) => setCreativityMeter(e.target.value)}
            />
          </div>
          <div className={s.content_right_bottom}>
            <div className={s.nothing_attached_text}>
              {resumePdf ? "Resume attached" : "Nothing currently attached"}
            </div>
            <label className={s.upload_resume_button}>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => fileUploaded(e)}
              />
              Upload CV
            </label>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "row",
              width: "100%",
              gap: "10px",
            }}
          >
            <button
              className={loading ? s.loading_button : s.generate_button}
              onClick={(e) => generateCoverLetter(e)}
            >
              GO!
            </button>
            {data.subscription_status !== "active" && (
              <button
                className={s.generate_button}
                onClick={(e) => setUpgradePopup(true)}
                style={{
                  backgroundColor: "#4A6CF7",
                  boxShadow: "0px 4px 4px rgba(74, 108, 247, 0.25)",
                }}
              >
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
