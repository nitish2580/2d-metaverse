const axios = require("axios");

const BACKEND_URL = "http://localhost:3000";
const WS__URL = "http://localhost:3001";
describe("Authentication", () => {
    test("user is able to signup only once", async () => {
        const username = "nitish123test" + Math.random();
        const password = "HelloHowAreYou@123";
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/signup`, {
            firstName: "",
            lastName: "",
            username,
            type: "admin",
            password,
        });
        expect(response.statusCode).toBe(200);

        const updatedResponse = await axios.post(
            `${BACKEND_URL}/api/v1/user/signup`,
            {
                firstName: "",
                lastName: "",
                username: "",
                type: "",
                password: "",
            }
        );
        expect(response.statusCode).toBe(400);
    });

    test("Singup request fails if the username is empty", async () => {
        const userName = "nitish123test" + Math.random();
        const password = "HelloHowAreYou@123";
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/signup`, {
            firstName: "",
            lastName: "",
            type: "",
            password: "",
        });
        expect(response.statusCode).toBe(200);
    });

    test("Signin succed if the username and password are smae", async () => {
        const username = `nitish123test-${Math.random()}`;
        const password = "HelloHowAreYou@123";
        await axios.post(`${BACKEND_URL}/api/v1/user/signup`, {
            firstName: "",
            lastName: "",
            username,
            type: "",
            password,
        });
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/signin`, {
            username: "",
            password: "",
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.token).toBeDefined();
    });

    test("Signin failed if the username and password are not smae", async () => {
        const username = `nitish123test-${Math.random()}`;
        const password = "HelloHowAreYou@123";
        await axios.post(`${BACKEND_URL}/api/v1/user/signup`, {
            username,
            type: "",
            password,
        });
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/signin`, {
            username,
            password: "",
        });
        expect(response.statusCode).toBe(403);
    });
});

describe("user metdata endpoint", () => {
    let token = "";
    let avatarId = "";
    let adminToken = "";
    let userToken = "";
    let adminId = "";
    let userId = "";
    beforeAll(async () => {
        const username = `nitishtest-${Math.random()}`;
        const password = "HelloHowAreYou@123";
        const signupResponse = await axios.post(
            `${BACKEND_URL}/api/v1/user/signup`,
            {
                firstName: "Nitish",
                lastName: "test",
                username: username,
                type: "admin",
                password,
            }
        );

        adminId = signupResponse?.data?.userId;
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/signin`, {
            username,
            password: "",
        });
        adminToken = response.data.token;

        const userSignupResponse = await axios.post(
            `${BACKEND_URL}/api/v1/user/signup`,
            {
                firstName: `${username}-user`,
                lastName: "test",
                username: username,
                type: "user",
                password,
            }
        );

        userId = userSignupResponse?.data?.userId;
        const userSigninResponse = await axios.post(
            `${BACKEND_URL}/api/v1/user/signin`,
            {
                username: `${username}-user`,
                password,
            }
        );
        token = userSigninResponse.data.token;

        const response2 = await axios.post(
            `${BACKEND_URL}/api/v1/admin/avatar`,
            {
                imageUrl:
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
                name: "Timmy",
            },
            {
                headers: {
                    authorization: `Bearer ${adminToken}`,
                },
            }
        );
        avatarId = response2?.data?.avatarId;
    });

    test("User can't update the metadata with wrong avatar id", async () => {
        const response = await axios.post(
            `${BACKEND_URL}/api/v1/user/metadata`,
            {
                avatarId: "123",
            },
            {
                headers: {
                    authorization: `Bearer ${token}`,
                },
            }
        );
        expect(response.statusCode).toBe(400);
    });

    test("User can update the metadata with right avatar id", async () => {
        const response = await axios.post(
            `${BACKEND_URL}/api/v1/user/metadata`,
            {
                avatarId,
            },
            {
                headers: {
                    authorization: `Bearer ${token}`,
                },
            }
        );
        expect(response.statusCode).toBe(200);
    });

    test("User is not able to update theier metada if the auth header is not present", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId,
        });
        expect(response.statusCode).toBe(403);
    });
});

describe("User avatar information", () => {
    let avatarId = "";
    let token = "";
    let userId = "";
    let adminId = "";
    let adminToken = "";
    beforeAll(async () => {
        const username = `nitishtest-${Math.random()}`;
        const password = "HelloHowAreYou@123";
        const signupResponse = await axios.post(
            `${BACKEND_URL}/api/v1/user/signup`,
            {
                firstName: "Nitish",
                lastName: "test",
                username: username,
                type: "admin",
                password,
            }
        );

        adminId = signupResponse?.data?.userId;
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/signin`, {
            username,
            password: "",
        });
        adminToken = response.data.token;

        const userSignupResponse = await axios.post(
            `${BACKEND_URL}/api/v1/user/signup`,
            {
                firstName: `${username}-user`,
                lastName: "test",
                username: username,
                type: "user",
                password,
            }
        );

        userId = userSignupResponse?.data?.userId;
        const userSigninResponse = await axios.post(
            `${BACKEND_URL}/api/v1/user/signin`,
            {
                username: `${username}-user`,
                password,
            }
        );
        token = userSigninResponse.data.token;

        const response2 = await axios.post(
            `${BACKEND_URL}/api/v1/admin/avatar`,
            {
                imageUrl:
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
                name: "Timmy",
            },
            {
                headers: {
                    authorization: `Bearer ${adminToken}`,
                },
            }
        );
        avatarId = response2?.data?.avatarId;
    });

    test("Get back avatar information for a user", async () => {
        const response = await axios.get(
            `${BACKEND_URL}/api/v1/user/metadata/bulk?ids[${userId}]`
        );
        expect(response?.data?.avatars?.length).toBe(1);
        expect(response?.data?.avatars[0].userId).toBe(userId);
    });

    test("Avaialable avatars lists are rencently created avatar", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/avatars`);
        expect(response?.data?.avatars.length).not.toBe(0);
        const currentAvatar = response?.data?.avatars.find(
            (x) => x.id === avatarId
        );
        expect(currentAvatar).toBeDefined();
    });
});

describe("Space information", async () => {
    let avatarId = "";
    let adminToken = "";
    let adminId = "";
    let element1 = "";
    let element2 = "";
    let mapId = "";
    let userToken = "";
    let userId = "";
    // let spaceId = "";
    beforeAll(async () => {
        const username = `nitishtest-${Math.random()}`;
        const password = "HelloHowAreYou@123";
        const signupResponse = await axios.post(
            `${BACKEND_URL}/api/v1/user/signup`,
            {
                firstName: "Nitish",
                lastName: "test",
                username: username,
                type: "admin",
                password,
            }
        );

        adminId = signupResponse?.data?.userId;
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/signin`, {
            username,
            password,
        });
        adminToken = response.data.token;

        const userSignupResponse = await axios.post(
            `${BACKEND_URL}/api/v1/user/signup`,
            {
                firstName: `${username}-user`,
                lastName: "test",
                username: username,
                type: "user",
                password,
            }
        );

        userId = userSignupResponse?.data?.userId;
        const userSigninResponse = await axios.post(
            `${BACKEND_URL}/api/v1/user/signin`,
            {
                username: `${username}-user`,
                password,
            }
        );
        userToken = userSigninResponse.data.token;

        const elment1 = await axios.post(
            `${BACKEND_URL}/api/admin/element`,
            {
                imageUrl:
                    "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
                width: 1,
                height: 1,
                static: true,
            },
            {
                headers: {
                    authorization: `Bearer ${adminToken}`,
                },
            }
        );

        const elment2 = await axios.post(
            `${BACKEND_URL}/api/admin/element`,
            {
                imageUrl:
                    "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
                width: 1,
                height: 1,
                static: true,
            },
            {
                headers: {
                    authorization: `Bearer ${adminToken}`,
                },
            }
        );

        element1 = elment1.data?.id;
        element2 = element2.data?.id;

        const map = await axios.post(
            `${BACKEND_URL}/api/v1/admin/map`,
            {
                thumbnail: "https://thumbnail.com/a.png",
                dimensions: "100x200",
                name: "100 person interview room",
                defaultElements: [
                    {
                        elementId: element1,
                        x: 20,
                        y: 20,
                    },
                    {
                        elementId: elment2,
                        x: 18,
                        y: 20,
                    },
                ],
            },
            {
                headers: {
                    authorization: `Bearer ${adminToken}`,
                },
            }
        );

        const response2 = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            imageUrl:
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            name: "Timmy",
        });
        avatarId = response2?.data?.avatarId;
    });

    test("user is able to create the space without any mapId", async () => {
        const response = await axios.post(
            `${BACKEND_URL}/api/v1/space`,
            {
                name: "Test",
                dimension: "100x200",
            },
            {
                headers: {
                    authorization: `Bearer ${userToken}`,
                },
            }
        );
        expect(response?.statusCode).toBe(200);
        expect(response?.data.spaceId).toBeDefined();
    });

    test("user is not  able to create the space without   mapId and dimension", async () => {
        const response = await axios.post(
            `${BACKEND_URL}/api/v1/space`,
            {
                name: "Test",
            },
            {
                headers: {
                    authorization: `Bearer ${userToken}`,
                },
            }
        );
        expect(response?.statusCode).toBe(400);
    });

    test("user is able to create the space with  mapId", async () => {
        const response = await axios.post(
            `${BACKEND_URL}/api/v1/space`,
            {
                name: "Test",
                dimension: "100x200",
                mapId: mapId,
            },
            {
                headers: {
                    authorization: `Bearer ${userToken}`,
                },
            }
        );
        expect(response?.statusCode).toBe(200);
        expect(response?.data.spaceId).toBeDefined();
        // spaceId = response?.dagta?.spaceId;
    });

    test("user is not able to delete any space that doesn't exists", async () => {
        const response = await axios.delete(
            `${BACKEND_URL}/api/v1/space/randomIdDoesn'texists,`,
            {
                headers: {
                    authorization: `Bearer ${userToken}`,
                },
            }
        );
        expect(response.statusCode).toBe(400);
    });

    test("user is able to delete any space that does exists", async () => {
        const response = await axios.post(
            `${BACKEND_URL}/api/v1/space`,
            {
                name: "Test",
                dimension: "100x200",
            },
            {
                headers: {
                    authorization: `Bearer ${userToken}`,
                },
            }
        );
        const deleteResponse = await axios.delete(
            `${BACKEND_URL}/api/v1/space/${resonse?.data?.spaceId}`,
            {
                headers: {
                    authorization: `Bearer ${userToken}`,
                },
            }
        );
        expect(deleteResponse.statusCode).toBe(200);
    });

    test("user can only delete their own space id", async () => {
        const response = await axios.post(
            `${BACKEND_URL}/api/v1/space`,
            {
                name: "Test",
                dimension: "100x200",
            },
            {
                headers: {
                    authorization: `Bearer ${userToken}`,
                },
            }
        );
        const deleteResponse = await axios.delete(
            `${BACKEND_URL}/api/v1/space/${resonse?.data?.spaceId}`,
            {
                headers: {
                    authorization: `Bearer ${adminToken}`,
                },
            }
        );
    });

    test("Admin has no space initially", async () => {
        const spaceIdResponse = await axios.post(
            `${BACKEND_URL}/api/v1/space`,
            {
                name: "Test",
                dimension: "100x200",
            },
            {
                headers: {
                    authorization: `Bearer ${userToken}`,
                },
            }
        );
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`);
        const filiteredResponse = response.data.find(
            (x) => x.id === spaceIdResponse?.data?.spaceId
        );
        expect(getResponse.data.spaces.length).not.toBe(0);
        expect(filiteredResponse).toBeDefined();
        expect();
    });
});

describe("Arena endpoints", () => {
    let avatarId = "";
    let adminToken = "";
    let adminId = "";
    let element1 = "";
    let element2 = "";
    let mapId = "";
    let userToken = "";
    let userId = "";
    let spaceId = "";
    beforeAll(async () => {
        const username = `nitishtest-${Math.random()}`;
        const password = "HelloHowAreYou@123";
        const signupResponse = await axios.post(
            `${BACKEND_URL}/api/v1/user/signup`,
            {
                firstName: "Nitish",
                lastName: "test",
                username: username,
                type: "admin",
                password,
            }
        );

        adminId = signupResponse?.data?.userId;
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/signin`, {
            username,
            password,
        });
        adminToken = response.data.token;

        const userSignupResponse = await axios.post(
            `${BACKEND_URL}/api/v1/user/signup`,
            {
                firstName: `${username}-user`,
                lastName: "test",
                username: username,
                type: "user",
                password,
            }
        );

        userId = userSignupResponse?.data?.userId;
        const userSigninResponse = await axios.post(
            `${BACKEND_URL}/api/v1/user/signin`,
            {
                username: `${username}-user`,
                password,
            }
        );
        userToken = userSigninResponse.data.token;

        const elment1 = await axios.post(
            `${BACKEND_URL}/api/admin/element`,
            {
                imageUrl:
                    "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
                width: 1,
                height: 1,
                static: true,
            },
            {
                headers: {
                    authorization: `Bearer ${adminToken}`,
                },
            }
        );

        const elment2 = await axios.post(
            `${BACKEND_URL}/api/admin/element`,
            {
                imageUrl:
                    "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
                width: 1,
                height: 1,
                static: true,
            },
            {
                headers: {
                    authorization: `Bearer ${adminToken}`,
                },
            }
        );

        element1 = elment1.data?.id;
        element2 = element2.data?.id;

        const map = await axios.post(
            `${BACKEND_URL}/api/v1/admin/map`,
            {
                thumbnail: "https://thumbnail.com/a.png",
                dimensions: "100x200",
                name: "100 person interview room",
                defaultElements: [
                    {
                        elementId: element1,
                        x: 20,
                        y: 20,
                    },
                    {
                        elementId: element1,
                        x: 18,
                        y: 22,
                    },
                    {
                        elementId: elment2,
                        x: 18,
                        y: 20,
                    },
                ],
            },
            {
                headers: {
                    authorization: `Bearer ${adminToken}`,
                },
            }
        );

        mapId = map?.data?.id;

        const response2 = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            imageUrl:
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            name: "Timmy",
        });
        avatarId = response2?.data?.avatarId;

        const spaceResponse = await axios.post(
            `${BACKEND_URL}/api/v1/space`,
            {
                name: "Test",
                dimension: "100x200",
                mapId: mapId,
            },
            {
                headers: {
                    authorization: `Bearer ${userToken}`,
                },
            }
        );
        spaceId = spaceResponse?.data?.spaceId;
    });

    test("Incorrect space id return a 400", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/123sasdfd`, {
            headers: {
                authorization: `Bearer ${userToken}`,
            },
        });
        expect(response.statusCode).toBe(400);
    });

    test("Correct space id return the all the element", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            headers: {
                authorization: `Bearer ${userToken}`,
            },
        });
        expect(response?.data?.dimensions).toBe("100x200");
        expect(response?.data?.elements.length).toBe(3);
    });

    test("Delete endpont is able to delete  an element", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            headers: {
                authorization: `Bearer ${userToken}`,
            },
        });
        await axios.delete(
            `${BACKEND_URL}/api/v1/space/${element1}`,
            {
                spaceId: spaceId,
                elementId: response.data.elements[0].id,
            },
            {
                headers: {
                    authorization: `Bearer ${userToken}`,
                },
            }
        );

        const newResponse = await axios.get(
            `${BACKEND_URL}/api/v1/space/${spaceId},`,
            {
                headers: {
                    authorization: `Bearer ${userToken}`,
                },
            }
        );
        expect(newResponse?.data?.elements.length).toBe(2);
    });

    test("Adding element work as expected", async () => {
        const response = await axios.post(
            `${BACKEND_URL}/api/v1/space`,
            {
                elementId: elementId,
                spaceId: spaceId,
                x: 50,
                y: 20,
            },
            {
                headers: {
                    authorization: `Bearer ${userToken}`,
                },
            }
        );
        const newResponse = await axios.get(
            `${BACKEND_URL}/api/v1/space/${spaceId}`,
            {
                headers: {
                    authorization: `Bearer ${userToken}`,
                },
            }
        );
        expect(newResponse?.data?.elements.length).toBe(3);
    });

    test("Adding element fails if the elment fall outside the dimension", async () => {
        const response = await axios.post(
            `${BACKEND_URL}/api/v1/space`,
            {
                elementId: elementId,
                spaceId: spaceId,
                x: 10000,
                y: 10000,
            },
            {
                headers: {
                    authorization: `Bearer ${userToken}`,
                },
            }
        );
        expect(response.statusCode).toBe(404);
    });
});

describe("Admin enpoints", async () => {
    let avatarId = "";
    let adminToken = "";
    let adminId = "";
    let element1 = "";
    let element2 = "";
    let mapId = "";
    let userToken = "";
    let userId = "";
    let spaceId = "";
    beforeAll(async () => {
        const username = `nitishtest-${Math.random()}`;
        const password = "HelloHowAreYou@123";
        const signupResponse = await axios.post(
            `${BACKEND_URL}/api/v1/user/signup`,
            {
                firstName: "Nitish",
                lastName: "test",
                username: username,
                type: "admin",
                password,
            }
        );

        adminId = signupResponse?.data?.userId;
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/signin`, {
            username,
            password: "",
        });
        adminToken = response.data.token;

        const userSignupResponse = await axios.post(
            `${BACKEND_URL}/api/v1/user/signup`,
            {
                firstName: `${username}-user`,
                lastName: "test",
                username: username,
                type: "user",
                password,
            }
        );

        userId = userSignupResponse?.data?.userId;
        const userSigninResponse = await axios.post(
            `${BACKEND_URL}/api/v1/user/signin`,
            {
                username: `${username}-user`,
                password,
            }
        );
        userToken = userSigninResponse.data.token;

        const elment1 = await axios.post(
            `${BACKEND_URL}/api/admin/element`,
            {
                imageUrl:
                    "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
                width: 1,
                height: 1,
                static: true,
            },
            {
                headers: {
                    authorization: `Bearer ${adminToken}`,
                },
            }
        );

        const elment2 = await axios.post(
            `${BACKEND_URL}/api/admin/element`,
            {
                imageUrl:
                    "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
                width: 1,
                height: 1,
                static: true,
            },
            {
                headers: {
                    authorization: `Bearer ${adminToken}`,
                },
            }
        );

        element1 = elment1.data?.id;
        element2 = element2.data?.id;

        const map = await axios.post(
            `${BACKEND_URL}/api/v1/admin/map`,
            {
                thumbnail: "https://thumbnail.com/a.png",
                dimensions: "100x200",
                name: "100 person interview room",
                defaultElements: [
                    {
                        elementId: element1,
                        x: 20,
                        y: 20,
                    },
                    {
                        elementId: element1,
                        x: 18,
                        y: 22,
                    },
                    {
                        elementId: elment2,
                        x: 18,
                        y: 20,
                    },
                ],
            },
            {
                headers: {
                    authorization: `Bearer ${adminToken}`,
                },
            }
        );

        mapId = map?.data?.id;

        const response2 = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            imageUrl:
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            name: "Timmy",
        });
        avatarId = response2?.data?.avatarId;

        const spaceResponse = await axios.post(
            `${BACKEND_URL}/api/v1/space`,
            {
                name: "Test",
                dimension: "100x200",
                mapId: mapId,
            },
            {
                headers: {
                    authorization: `Bearer ${userToken}`,
                },
            }
        );
        spaceId = spaceResponse?.data?.spaceId;
    });

    test("User is not able to hit all the endpoint", async () => {
        const elementResponse = await axios.post(
            `${BACKEND_URL}/api/admin/element`,
            {
                imageUrl:
                    "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
                width: 1,
                height: 1,
                static: true,
            },
            {
                headers: {
                    authorization: `Bearer ${userToken}`,
                },
            }
        );
        const mapResponse = await axios.post(
            `${BACKEND_URL}/api/v1/admin/map`,
            {
                thumbnail: "https://thumbnail.com/a.png",
                dimensions: "100x200",
                name: "100 person interview room",
                defaultElements: [
                    {
                        elementId: element1,
                        x: 20,
                        y: 20,
                    },
                    {
                        elementId: element1,
                        x: 18,
                        y: 22,
                    },
                    {
                        elementId: elment2,
                        x: 18,
                        y: 20,
                    },
                ],
            },
            {
                headers: {
                    authorization: `Bearer ${userToken}`,
                },
            }
        );

        const createAvatarResponse = await axios.post(
            `${BACKEND_URL}/api/v1/admin/avatar`,
            {
                imageUrl:
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
                name: "Timmy",
            },
            {
                headers: {
                    authorization: `Bearer ${userToken}`,
                },
            }
        );

        const updateElementResponse = await axios.put(
            `${BACKEND_URL}/api/v1/admin/element/${element1}`,
            {
                imageUrl:
                    "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            },
            {
                headers: {
                    authorization: `Bearer ${userToken}`,
                },
            }
        );
        expect(elementResponse.statusCode).toBe(403);
        expect(mapResponse.statusCode).toBe(403);
        expect(createAvatarResponse.statusCode).toBe(403);
        expect(updateElementResponse.statusCode).toBe(403);
    });

    test("Admin is able to hit all the endpoint", async () => {
        const elementResponse = await axios.post(
            `${BACKEND_URL}/api/admin/element`,
            {
                imageUrl:
                    "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
                width: 1,
                height: 1,
                static: true,
            },
            {
                headers: {
                    authorization: `Bearer ${adminToken}`,
                },
            }
        );
        const mapResponse = await axios.post(
            `${BACKEND_URL}/api/v1/admin/map`,
            {
                thumbnail: "https://thumbnail.com/a.png",
                dimensions: "100x200",
                name: "100 person interview room",
                defaultElements: [
                    {
                        elementId: element1,
                        x: 20,
                        y: 20,
                    },
                    {
                        elementId: element1,
                        x: 18,
                        y: 22,
                    },
                    {
                        elementId: elment2,
                        x: 18,
                        y: 20,
                    },
                ],
            },
            {
                headers: {
                    authorization: `Bearer ${adminToken}`,
                },
            }
        );

        const createAvatarResponse = await axios.post(
            `${BACKEND_URL}/api/v1/admin/avatar`,
            {
                imageUrl:
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
                name: "Timmy",
            },
            {
                headers: {
                    authorization: `Bearer ${adminToken}`,
                },
            }
        );

        const updateElementResponse = await axios.put(
            `${BACKEND_URL}/api/v1/admin/element/${element1}`,
            {
                imageUrl:
                    "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            },
            {
                headers: {
                    authorization: `Bearer ${adminToken}`,
                },
            }
        );
        expect(elementResponse.statusCode).toBe(200);
        expect(mapResponse.statusCode).toBe(200);
        expect(createAvatarResponse.statusCode).toBe(200);
        // expect(updateElementResponse.statusCode).toBe(200)
    });

    test("Admin is able to update the element image url", async () => {
        const elment = await axios.post(
            `${BACKEND_URL}/api/admin/element`,
            {
                imageUrl:
                    "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
                width: 1,
                height: 1,
                static: true,
            },
            {
                headers: {
                    authorization: `Bearer ${adminToken}`,
                },
            }
        );
        const updateElementResponse = await axios.put(
            `${BACKEND_URL}/api/v1/admin/element/${element}`,
            {
                imageUrl:
                    "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            },
            {
                headers: {
                    authorization: `Bearer ${adminToken}`,
                },
            }
        );
        expect(updateElementResponse.statusCode).toBe(200);
    });
});

describe("websocket test", async () => {
    let avatarId = "";
    let adminToken = "";
    let adminId = "";
    let element1 = "";
    let element2 = "";
    let mapId = "";
    let userToken1 = "";
    let userToken2 = "";
    let userId1 = "";
    let userId2 = "";
    let ws1 = "";
    let ws2 = "";
    let ws1Messages = [];
    let ws2Messages = [];
    let user1x;
    let user1y;
    let user2x;
    let user2y;

    async function waitForPopLatestMessage(messageArray) {
        return new Promise(resolve => {
            if (messageArray.length > 0) {
                resolve(messageArray.shift())
            } else {
                const interval = setInterval(() => {
                    if (messageArray.length > 0) {
                        resolve(messageArray.shift());
                        clearInterval(interval);
                    }
                }, 100)
            }
        })
    }

    async function setupHTTP() {
        const username1 = `nitishtest-${Math.random()}`;
        const username2 = `nitishtest2-${Math.random()}`;
        const password = "HelloHowAreYou@123";
        const signupResponse = await axios.post(
            `${BACKEND_URL}/api/v1/user/signup`,
            {
                firstName: "Nitish",
                lastName: "test",
                username: username,
                type: "admin",
                password,
            }
        );

        adminId = signupResponse?.data?.userId;
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/signin`, {
            username1,
            password,
        });
        adminToken = response.data.token;

        const userSignupResponse1 = await axios.post(
            `${BACKEND_URL}/api/v1/user/signup`,
            {
                firstName: `${username1}-user`,
                lastName: "test",
                username: username1,
                type: "user",
                password,
            }
        );

        userId1 = userSignupResponse1?.data?.userId;
        const userSigninResponse1 = await axios.post(
            `${BACKEND_URL}/api/v1/user/signin`,
            {
                username: `${username}-user`,
                password,
            }
        );
        userToken1 = userSigninResponse1.data.token;


        const userSignupResponse2 = await axios.post(
            `${BACKEND_URL}/api/v1/user/signup`,
            {
                firstName: `${username1}-user`,
                lastName: "test",
                username: username1,
                type: "user",
                password,
            }
        );

        userId2 = userSignupResponse2?.data?.userId;
        const userSigninResponse2 = await axios.post(
            `${BACKEND_URL}/api/v1/user/signin`,
            {
                username: `${username2}-user`,
                password,
            }
        );
        userToken2 = userSigninResponse2.data.token;

        const elment1 = await axios.post(
            `${BACKEND_URL}/api/admin/element`,
            {
                imageUrl:
                    "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
                width: 1,
                height: 1,
                static: true,
            },
            {
                headers: {
                    authorization: `Bearer ${adminToken}`,
                },
            }
        );

        const elment2 = await axios.post(
            `${BACKEND_URL}/api/admin/element`,
            {
                imageUrl:
                    "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
                width: 1,
                height: 1,
                static: true,
            },
            {
                headers: {
                    authorization: `Bearer ${adminToken}`,
                },
            }
        );

        element1 = elment1.data?.id;
        element2 = element2.data?.id;

        const map = await axios.post(
            `${BACKEND_URL}/api/v1/admin/map`,
            {
                thumbnail: "https://thumbnail.com/a.png",
                dimensions: "100x200",
                name: "100 person interview room",
                defaultElements: [
                    {
                        elementId: element1,
                        x: 20,
                        y: 20,
                    },
                    {
                        elementId: element1,
                        x: 18,
                        y: 22,
                    },
                    {
                        elementId: elment2,
                        x: 18,
                        y: 20,
                    },
                ],
            },
            {
                headers: {
                    authorization: `Bearer ${adminToken}`,
                },
            }
        );
        mapId = map?.data?.id;
        const response2 = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            imageUrl:
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            name: "Timmy",
        });
        avatarId = response2?.data?.avatarId;
        const spaceResponse = await axios.post(
            `${BACKEND_URL}/api/v1/space`,
            {
                name: "Test",
                dimension: "100x200",
                mapId: mapId,
            },
            {
                headers: {
                    authorization: `Bearer ${userToken}`,
                },
            }
        );
        spaceId = spaceResponse?.data?.spaceId;
    }

    async function setupWs() {
        ws1 = new WebSocket(WS__URL);
        await new Promise(r => {
            ws1.onopen = r;
        })
        ws1.onmessage = (event) => {
            ws1Messages.push(JSON.parse(event.data));
        }

        ws2 = new WebSocket(WS__URL);
        await new Promise(r => {
            ws2.onopen = r;
        })

        ws2.onmessage = (event) => {
            ws2Messages.push(JSON.parse(event.data));
        }

    }
    beforeAll(async () => {
        setupHTTP()
        setupWs()
    });

    test("Get back the ack of the joining the space", async () => {
        ws1.send(JSON.stringify({
            "type": "join",
            "payload": {
                "spaceId": spaceId,
                "token": userToken1,
            }
        }))

        ws2.send(JSON.stringify({
            "type": "join",
            "payload": {
                "spaceId": spaceId,
                "token": usertoken2,
            }
        }))

        const message1 = await waitForPopLatestMessage(ws1Messages);
        const message2 = await waitForPopLatestMessage(ws2Messages);
        const message3 = await waitForPopLatestMessage(ws1Messages);

        expect(message1.type).toBe("space-joined");
        expect(message2.type).toBe("space-joined");
        expect(message3.type).toBe("user-join");
        expect(message3.payload.x).toBe(message2.payload.spawn.x);
        expect(message3.payload.y).toBe(message2.payload.spawn.y);
        expect(message3.payload.userId).toBe(userId2);


        expect(message1.payload.users.length + message2.payload.users.length).toBe(1);

        user1x = message1.payload.spawn.x;
        user1y = message1.payload.spawn.y;
        user2x = message2.payload.spawn.x;
        user2y = message2.payload.spawn.y;

    })

    test("User should not able to move across the wall", async () => {
        ws1.send(JSON.stringify(
            {
                type: "movement",
                payload: {
                    x: 100000000,
                    y: 100000000,
                }
            }
        ))

        const message = await waitForPopLatestMessage(ws1Messages);
        expect(message.type).toBe("movement-rejected");
        expect(message.payload.x).toBe(user1x);
        expect(message.payload.y).toBe(user1y);
    })

    test("User should not be able to move two block at same time", async () => {
        ws1.send(JSON.stringify(
            {
                type: "movement",
                payload: {
                    x: user1x + 2,
                    y: user1y,
                }
            }
        ))

        const message = await waitForPopLatestMessage(ws1Messages);
        expect(message.type).toBe("movement-rejected");
        expect(message.payload.x).toBe(user1x);
        expect(message.payload.y).toBe(user1y);
    })

    test("Correct movement should be broadcasted to other socket in room ", async () => {
        ws1.send(JSON.stringify(
            {
                type: "movement",
                payload: {
                    x: user1x + 2,
                    y: user1y,
                }
            }
        ))

        const message = await waitForPopLatestMessage(ws2Messages);
        expect(message.type).toBe("movement");
        expect(message.payload.x).toBe(user2x);
        expect(message.payload.y).toBe(user2y);
    })

    test("If a user left, other user recieve the leave event", async () => {
        ws1.close();

        const message = await waitForPopLatestMessage(ws2Messages);
        expect(message.type).toBe("user-left");
        expect(message.payload.userId).toBe(userId2);
    })

});
