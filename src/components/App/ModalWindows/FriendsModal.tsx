import ModalHeading from "./ModalHeading";

const FriendsModal = () => {
  return (
    <div className="p-5 ">
      <ModalHeading
        headingList={["Friends", "Friend requests", "Online Friends "]}
      />
    </div>
  );
};
export default FriendsModal;