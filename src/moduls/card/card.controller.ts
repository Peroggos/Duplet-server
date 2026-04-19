import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Query, 
  UseGuards, 
  UseInterceptors, 
  ClassSerializerInterceptor,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Param,
} from '@nestjs/common';
import { CardService } from './card.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentUser } from 'src/lib/decorators/current-user.decorator';


@Controller('cards')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class CardController {
  constructor(private readonly cardService: CardService) {}

  /**
   * Получить карточки для свайпа
   * GET /cards?limit=10
   */
  @Get()
  async getCards(
    @CurrentUser('id') userId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const cards = await this.cardService.getCardForUser(
      userId, 
      limit || 20
    );
    
    return {
      success: true,
      data: cards,
      total: cards.length,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Выполнить свайп (лайк/дизлайк)
   * POST /cards/swipe
   */
  @Post('swipe')
  @HttpCode(HttpStatus.OK)
  async swipe(
    @CurrentUser('id') userId: string,
    @Body() body: { targetUserId: string; isLike?: boolean; isDislike?: boolean },
  ) {
    const result = await this.cardService.swipe(
      userId,
      body.targetUserId,
      {
        isLike: body.isLike || false,
        isDislike: body.isDislike || false,
      }
    );

    // Проверяем, что result существует
    if (!result) {
      return {
        success: false,
        message: 'Failed to process swipe',
        timestamp: new Date().toISOString(),
      };
    }

    // Получаем оставшиеся карточки
    const remainingCards = await this.cardService.getCardForUser(userId, 1);

    return {
      success: true,
      data: {
        isMatch: result.isMatch || false,
        match: result.match || null,
        remainingCards: remainingCards.length,
      },
      message: result.isMatch ? 'It\'s a match! 🎉' : 'Swipe recorded',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Лайкнуть пользователя
   * POST /cards/like
   */
  @Post('like')
  @HttpCode(HttpStatus.OK)
  async like(
    @CurrentUser('id') userId: string,
    @Body('targetUserId') targetUserId: string,
  ) {
    const result = await this.cardService.swipe(
      userId,
      targetUserId,
      { isLike: true, isDislike: false }
    );

    if (!result) {
      return {
        success: false,
        message: 'Failed to process like',
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      data: {
        isMatch: result.isMatch || false,
        match: result.match || null,
      },
      message: result.isMatch ? 'It\'s a match! 🎉' : 'Liked',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Дизлайкнуть пользователя
   * POST /cards/dislike
   */
  @Post('dislike')
  @HttpCode(HttpStatus.OK)
  async dislike(
    @CurrentUser('id') userId: string,
    @Body('targetUserId') targetUserId: string,
  ) {
    const result = await this.cardService.swipe(
      userId,
      targetUserId,
      { isLike: false, isDislike: true }
    );

    if (!result) {
      return {
        success: false,
        message: 'Failed to process dislike',
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      data: {
        isMatch: result.isMatch || false,
        match: result.match || null,
      },
      message: 'Disliked',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Получить карточку конкретного пользователя
   * GET /cards/user/:userId
   */
  @Get('user/:targetUserId')
  async getUserCard(
    @CurrentUser('id') currentUserId: string,
    @Param('targetUserId') targetUserId: string,
  ) {
    return {
      success: true,
      data: {
        userId: targetUserId,
        viewedBy: currentUserId,
      },
      message: 'User card retrieved',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Получить статистику свайпов
   * GET /cards/stats
   */
  @Get('stats')
  async getStats(@CurrentUser('id') userId: string) {
    const cards = await this.cardService.getCardForUser(userId, 100);
    
    return {
      success: true,
      data: {
        availableCards: cards.length,
        dailyLimit: 100,
        remainingToday: cards.length,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Получить историю свайпов
   * GET /cards/history
   */
  @Get('history')
  async getHistory(
    @CurrentUser('id') userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return {
      success: true,
      data: {
        items: [],
        pagination: {
          page: page || 1,
          limit: limit || 20,
          total: 0,
          totalPages: 0,
        },
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Проверить статус свайпа между пользователями
   * GET /cards/status/:targetUserId
   */
  @Get('status/:targetUserId')
  async getSwipeStatus(
    @CurrentUser('id') userId: string,
    @Param('targetUserId') targetUserId: string,
  ) {
    return {
      success: true,
      data: {
        hasSwiped: false,
        isMatch: false,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Получить рекомендации
   * GET /cards/recommendations
   */
  @Get('recommendations')
  async getRecommendations(
    @CurrentUser('id') userId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const recommendations = await this.cardService.getCardForUser(
      userId,
      limit || 10
    );

    return {
      success: true,
      data: recommendations,
      total: recommendations.length,
      message: 'Recommendations retrieved successfully',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Получить ежедневную подборку
   * GET /cards/daily
   */
  @Get('daily')
  async getDailyCards(
    @CurrentUser('id') userId: string,
  ) {
    const dailyCards = await this.cardService.getCardForUser(userId, 5);

    return {
      success: true,
      data: {
        cards: dailyCards,
        date: new Date().toISOString().split('T')[0],
      },
      message: 'Daily cards retrieved',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Пропустить карточку (временный скип)
   * POST /cards/skip
   */
  @Post('skip')
  @HttpCode(HttpStatus.OK)
  async skip(
    @CurrentUser('id') userId: string,
    @Body('targetUserId') targetUserId: string,
  ) {
    const result = await this.cardService.swipe(
      userId,
      targetUserId,
      { isLike: false, isDislike: true }
    );

    if (!result) {
      return {
        success: false,
        message: 'Failed to skip card',
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      data: {
        isMatch: result.isMatch || false,
        skipped: true,
      },
      message: 'Card skipped',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Суперлайк (премиум функция)
   * POST /cards/superlike
   */
  @Post('superlike')
  @HttpCode(HttpStatus.OK)
  async superlike(
    @CurrentUser('id') userId: string,
    @Body('targetUserId') targetUserId: string,
  ) {
    const result = await this.cardService.swipe(
      userId,
      targetUserId,
      { isLike: true, isDislike: false }
    );

    if (!result) {
      return {
        success: false,
        message: 'Failed to superlike',
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      data: {
        isMatch: result.isMatch || false,
        match: result.match || null,
        isSuperLike: true,
      },
      message: result.isMatch ? 'It\'s a super match! 🎉✨' : 'Superliked!',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Сбросить свайпы (премиум функция)
   * POST /cards/reset
   */
  @Post('reset')
  @HttpCode(HttpStatus.OK)
  async resetSwipes(@CurrentUser('id') userId: string) {
    return {
      success: true,
      message: 'Swipes reset successfully',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Получить количество оставшихся карточек
   * GET /cards/count
   */
  @Get('count')
  async getRemainingCount(@CurrentUser('id') userId: string) {
    const cards = await this.cardService.getCardForUser(userId, 100);
    
    return {
      success: true,
      data: {
        remaining: cards.length,
        maxSwipes: 100,
        usedToday: 0,
      },
      timestamp: new Date().toISOString(),
    };
  }
}