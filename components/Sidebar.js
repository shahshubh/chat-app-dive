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
	const [avatarUrl, setAvatarUrl] = useState("");

	const router = useRouter();
	// get current user avatarUrl from value in useEffect
	useEffect(() => {
		if (value) {
			const user = value.docs.find((doc) => doc.id === auth.currentUser.uid);
			setAvatarUrl(user.data().avatarUrl);
		}
	}, [value]);


	let list = value?.docs.map((doc) => {
		doc = doc.data();
		let status =
			presence[doc.uid] === "online"
				? "online"
				: `Last seen ${timeDifference(new Date(), new Date(presence[doc.uid] * 1000))}`;
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
					src={doc.avatarUrl ? doc.avatarUrl : constants.avatarUrl}
					alt="avatar"
				/>
				<div className="about">
					<div className="name">{doc.displayName}</div>
					<div className="status">
						<i className={`fa fa-circle ${status}`}></i>
						{" "}{status}
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
			.then(() => router.reload(window.location.pathname))
			.catch((error) => console.log(error));
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
			<ul className="list-unstyled chat-list mb-0">
				<li className="clearfix user-head-li">
					<img src={avatarUrl ? avatarUrl : constants.avatarUrl} alt="avatar" />
					<div className="about">
						<div className="name">{user.displayName}</div>
					</div>
					<i className="fa fa-sign-out pull-right" onClick={signOut} ></i>
				</li>
				{list}
			</ul>
		</div>
	);
};

export default Sidebar;
