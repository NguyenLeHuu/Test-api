import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import styled from "styled-components";
const SentMessage = styled.li`
  background-color: #dcf1c7;
  float: right;
  clear: both;
  margin: 10px;
  padding: 10px;
  border-radius: 10px;
`;

const ReceivedMessage = styled.li`
  background-color: #e5e5ea;
  float: left;
  clear: both;
  margin: 10px;
  padding: 10px;
  border-radius: 10px;
`;
const socket = io("https://clinicsystem.io.vn/"); // Thay 'http://your-socket-server-url' bằng URL của máy chủ Socket.IO của bạn
// const socket = io("http://localhost:3000");

function MyComponent() {
  const [messages, setMessages] = useState([]);
  const [data_api, setdata_api] = useState([]);
  const [idLogin, setIdLogin] = useState("");
  const [user1, setUser1] = useState("");
  const [user2, setUser2] = useState("");
  const [renderTrigger, setRenderTrigger] = useState(false);
  // Kết nối đến máy chủ Socket.IO

  useEffect(() => {
    if (idLogin !== "") {
      if (idLogin === "customer1") {
        setUser1("customer1");
        setUser2("clinic");
      } else if (idLogin === "clinic") {
        setUser1("clinic");
        setUser2("customer1");
      } else {
        setUser1("customer2");
        setUser2("clinic");
      }
    } else {
      console.log("đăng nhập đ");
    }
  }, [idLogin]);

  useEffect(() => {
    fetchData();
    socket.on("server-send-data_seft", (message) => {
      // setMessages((prevMessages) => [...prevMessages, message]);
      console.log("message gửi", message);
      fetchData();
    });

    socket.on("server-send-data", (message) => {
      // setMessages((prevMessages) => [...prevMessages, message]);
      console.log("message nhận", message.msg);
      fetchData();
    });
  }, []);

  useEffect(() => {
    //viết giùm tôi để khi data_api cập nhật thì màn hình cũng render lại
    // Tạo một state tạm thời để gây ra việc render lại khi data_api thay đổi

    // Gán giá trị renderTrigger bằng giá trị ngẫu nhiên để kích hoạt render
    setRenderTrigger(!renderTrigger);
    console.log("Render lại màn hình vì data_api đã thay đổi");
  }, [data_api]);

  const fetchData = () => {
    fetch(
      `https://clinicsystem.io.vn/content_chat/?chat_id=75e72f990d5b6fe886b2d0430c1f7a&user1=${user1}&user2=${user2}`
      // `http://localhost:3000/content_chat/?chat_id=75e72f990d5b6fe886b2d0430c1f7a&user1=${user1}&user2=${user2}`
    )
      .then((response) => {
        if (response.ok) {
          // console.log(response);
          return response.json();
        } else {
          // throw new Error("Có lỗi xảy ra khi tải dữ liệu.");
        }
      })
      .then((data) => {
        console.log("dataapi:", data.data);
        setdata_api(data.data);
        // setMessages(data); // Cập nhật state với dữ liệu mới
      })
      .catch((error) => {
        // console.error("Lỗi:", error);
      });
  };

  const sendMessage = (message) => {
    // Gửi tin nhắn đến máy chủ khi người dùng gửi một biểu mẫu hoặc thực hiện hành động nào đó
    //gọi api ->trả dữ liệu về xong mới gọi socket
    // Thông tin yêu cầu
    const requestInfo = {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user1: user1,
        user2: user2,
        message: message,
        type: "sent",
        chat_id: "75e72f990d5b6fe886b2d0430c1f7a",
      }),
    };

    // Thực hiện yêu cầu Fetch
    fetch("https://clinicsystem.io.vn/content_chat/", requestInfo)
      // fetch("http://localhost:3000/content_chat/", requestInfo)
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Có lỗi xảy ra khi gửi yêu cầu.");
        }
      })
      .then((data) => {
        console.log("Yêu cầu thành công:", data);
        const requestInfo1 = {
          method: "POST",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json; charset=utf-8",
          },
          body: JSON.stringify({
            user1: user2,
            user2: user1,
            message: message,
            type: "receive",
            chat_id: "75e72f990d5b6fe886b2d0430c1f7a",
          }),
        };
        fetch("https://clinicsystem.io.vn/content_chat/", requestInfo1)
          // fetch("http://localhost:3000/content_chat/", requestInfo1)
          .then((response) => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error("Có lỗi xảy ra khi gửi yêu cầu.");
            }
          })
          .then((data) => {
            // console.log("Yêu cầu thành công:", data);
            const da = {
              user1,
              user2,
              msg: message,
            };
            socket.emit("client-sent-message", da);
          })
          .catch((error) => {
            console.error("Lỗi:", error);
          });
      })
      .catch((error) => {
        console.error("Lỗi:", error);
      });
  };

  return (
    <div>
      <p>nhập id</p>
      <textarea
        rows="2"
        cols="50"
        value={idLogin}
        onChange={(e) => setIdLogin(e.target.value)}
      ></textarea>
      <button
        onClick={() => {
          const data = {};
          data.account_id = idLogin;
          socket.emit("login", data);
          alert(idLogin + " đã đăng nhập");
          fetchData();
        }}
      >
        Đăng nhập
      </button>
      <hr />

      <ul>
        {data_api.map((item, index) =>
          // Sử dụng các component đã tạo
          item.type === "sent" ? (
            <SentMessage key={index}>{item.message}</SentMessage>
          ) : (
            <ReceivedMessage key={index}>{item.message}</ReceivedMessage>
          )
        )}
      </ul>

      <div>
        <textarea id="myTextarea" rows="4" cols="50"></textarea>
        <button
          onClick={() => {
            var textarea = document.getElementById("myTextarea");
            sendMessage(textarea.value);
          }}
        >
          Gửi
        </button>
      </div>
    </div>
  );
}

export default MyComponent;
