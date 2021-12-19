import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useCollection } from "react-firebase-hooks/firestore";
import { useList } from "react-firebase-hooks/database";
import { firestore, auth, firebase } from "../Firebase/index";
import constants from "../constants/constants";
import { timeDifference } from "../utils/timeDifference";

const Sidebar = ({ user, handler }) => {
	const [value] = useCollection(firestore.collection("users"), {
		snapshotListenOptions: { includeMetadataChanges: true },
	});
	const [snapshots] = useList(firebase.database().ref("/online"));
	const [presence, setPresence] = useState({});

	const router = useRouter();

	// Generating list of users using this webapp with their online status
	let list = value?.docs.map((doc) => {
		doc = doc.data();
		let status =
			presence[doc.uid] === "online"
				? "online"
				: `Last seen at ${timeDifference(new Date(), new Date(presence[doc.uid] * 1000))}`;
		return doc.uid !== auth.currentUser.uid ? (
			<li
				className="clearfix"
				key={doc.uid}
				onClick={() =>
					handler({
						displayName: doc.displayName,
						uid: doc.uid,
						presence: status,
					})
				}
			>
				<img
					src={constants.avatarUrl}
					alt="avatar"
				/>
				<div className="about">
					<div className="name">{doc.displayName}</div>
					<div className="status">
						<i className={`fa fa-circle ${status}`}></i>
						{/* <FontAwesomeIcon icon="circle" color={status === "online" ? "green" : "red"} /> */}
						{status}{" "}
					</div>
				</div>
			</li>
		) : (
			""
		);
	});

	const signOut = () => {
		firebase
			.auth()
			.signOut()
			.then(
				function () {
					console.log("Signed Out");
					router.reload(window.location.pathname);
				},
				function (error) {
					console.error("Sign Out Error", error);
				}
			);
	};

	// This useEffect finds out who are online
	useEffect(() => {
		snapshots.map((v) => {
			if (v.val().online) setPresence((p) => ({ ...p, [v.key]: "online" }));
			else setPresence((p) => ({ ...p, [v.key]: v.val().time.seconds }));
		});
	}, [snapshots, value]);

	// This useEffect tracks if an user is online or not
	useEffect(() => {
		const userId = auth.currentUser.uid;

		const reference = firebase.database().ref(`/online/${userId}`);
		reference
			.set({ online: true })
			.then(() => console.log("Online presence set"));

		reference
			.onDisconnect()
			.set({ online: false, time: firebase.firestore.Timestamp.now() })
			.then(() => console.log("On disconnect function configured."));
	}, []);

	return (
		<div id="plist" className="people-list">
			<div style={{ marginBottom: "40px", padding: "10px", marginBottom: "1px solid black" }} >
				<span>{ user.displayName }</span>
				<button type="button" className="btn btn-danger pull-right" onClick={signOut} >Sign Out</button>
			</div>
			<ul className="list-unstyled chat-list mt-2 mb-0">
				{list}
			</ul>
		</div>
	);
};

export default Sidebar;
