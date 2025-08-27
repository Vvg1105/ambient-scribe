from typing import List, Literal, Optional
from pydantic import BaseModel, field_validator, Field

# ------- Client -> Server -------

class AudioInfo(BaseModel):
    """
    Audio information for transcription
    """
    codec: Literal["opus", "pcm16"]
    sampleRateHz: int = Field(..., description = "Use 16,000 or 48,000")
    channels: int = Field(..., description = "Current support is 1")

    @field_validator("sampleRateHz")
    @classmethod
    def validate_sample_rate(cls, v: int) -> int:
        if v not in [16000, 48000]:
            raise ValueError("Sample rate must be 16,000 or 48,000")
        return v
    
    @field_validator("channels")
    @classmethod
    def validate_channels(cls, v: int) -> int:
        if v != 1:
            raise ValueError("Channels must be 1")
        return v
    

class ClientInit(BaseModel):
    """
    Client initialization request
    """
    type: Literal["init"]
    sessionId: str
    audio: AudioInfo


class ClientAudio(BaseModel):
    """
    Client audio chunk
    """
    type: Literal["audio"]
    seq: int
    data: str


class ClientEnd(BaseModel):
    """
    Client end of session
    """
    type: Literal["end"]


# ------- Server -> Client -------

class ServerTranscriptChunk(BaseModel):
    type: Literal["transcript"] = "transcript"
    id: str
    text: str
    partial: bool
    startMs: int
    endMs: int


class ServerFinalSegment(BaseModel):
    text: str
    startMs: int
    endMs: int


class ServerFinal(BaseModel):
    type: Literal["final"] = "final"
    segments: List[ServerFinalSegment]


class ServerError(BaseModel):
    type: Literal["error"] = "error"
    message: str
    code: Optional[str] = None


