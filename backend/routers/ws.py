import json
from typing import List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from backend.schemas.transcription import (
    ClientInit, ClientAudio, ClientEnd,
    ServerTranscriptChunk, ServerFinal, ServerFinalSegment, ServerError
)

router = APIRouter()

@router.websocket("/ws/transcribe")
async def transcribe_ws(websocket: WebSocket):

    await websocket.accept()

    try:
        # Expect ClientInit
        init_raw = await websocket.receive_text()

        try:
            init_data = ClientInit.model_validate(json.loads(init_raw))
        
        except Exception as e:
            await websocket.send_json(ServerError(
                message = "Invalid init",
                code = "BAD_INIT"
            ).model_dump())
            await websocket.close(code = 1008, reason = "Invalid init")
            return
        
        partials: List[str] = []
        ms_cursor = 0
        last_seq = -1

        while True:
            raw = await websocket.receive_text()
            msg = json.loads(raw)
            t = msg["type"]

            if t == "audio":
                try:
                    audio = ClientAudio.model_validate(msg)
                
                except Exception as e:
                    await websocket.send_json(ServerError(
                        message = "Invalid audio",
                        code = "BAD_AUDIO"
                    ).model_dump())
                    continue

                if audio.seq <= last_seq:
                    await websocket.send_json(ServerError(
                        message = "Seq out of order",
                        code = "SEQ_ORDER"
                    ).model_dump())
                    continue
                
                last_seq = audio.seq

                if audio.seq % 2 == 0:
                    text = f"chunk {audio.seq} received"
                    start_ms, end_ms = ms_cursor, ms_cursor + 800
                    ms_cursor = end_ms
                    partials.append(text)

                    await websocket.send_json(
                        ServerTranscriptChunk(
                            id=f"t-{audio.seq}", text=text, partial=True,
                            startMs=start_ms, endMs=end_ms
                        ).model_dump()
                    )

            elif t == "end":
                try:
                    _ = ClientEnd.model_validate(msg)
                
                except Exception as e:
                    await websocket.send_json(ServerError(
                        message = "Invalid end",
                        code = "BAD_END"
                    ).model_dump())
                    continue
                
                final_text = " ".join(partials)
                await websocket.send_json(
                    ServerFinal(
                        segments = [ServerFinalSegment(
                            text = final_text,
                            startMs = 0,
                            endMs = max(ms_cursor, 1500)
                        )]
                    ).model_dump()
                )

                await websocket.close(code = 1000, reason = "End of session")
                return
            
            else:
                await websocket.send_json(ServerError(
                    message = "Unknown message type",
                    code = "BAD_TYPE"
                ).model_dump())

    except WebSocketDisconnect:
        pass

                