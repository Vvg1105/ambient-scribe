from typing import Generic, TypeVar, List, Optional, Type
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete, select, update
from sqlalchemy.orm import DeclarativeBase

ModelType = TypeVar('ModelType', bound=DeclarativeBase)

class BaseService(Generic[ModelType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model

    async def create(self, db: AsyncSession, **kwargs) -> ModelType:
        """Create a new record in the database"""
        db_obj = self.model(**kwargs)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    
    async def get(self, db: AsyncSession, id: int) -> Optional[ModelType]:
        """Get a record by its ID"""
        result = await db.execute(select(self.model).where(self.model.id == id))
        return result.scalar_one_or_none()
    
    async def get_all(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[ModelType]:
        """Get all records from the database"""
        result = await db.execute(select(self.model).offset(skip).limit(limit))
        return result.scalars().all()
    
    async def update(self, db: AsyncSession, id: int, **kwargs) -> Optional[ModelType]:
        """Update a record by its ID"""
        result = await db.execute(update(self.model).where(self.model.id == id).values(**kwargs))
        await db.commit()
        return await self.get(db, id)

    async def delete(self, db: AsyncSession, id: int) -> bool:
        """Delete a record by its ID"""
        result = await db.execute(delete(self.model).where(self.model.id == id))
        await db.commit()
        return result.rowcount > 0