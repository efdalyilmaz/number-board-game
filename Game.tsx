import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';

const BOARD_SIZE = 4;
const CELL_SIZE = Dimensions.get('window').width * 0.2;
const CELL_PADDING = 5;
const STARTING_NUMBER = 3; // Başlangıç sayısı 3 olarak değiştirildi (5 de olabilir)

type BoardType = number[][];

interface GameState {
  board: BoardType;
  score: number;
  gameOver: boolean;
}

const Game = () => {
  const [gameState, setGameState] = useState<GameState>({
    board: Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0)),
    score: 0,
    gameOver: false,
  });

  // Yeni oyun tahtası oluşturma
  const initializeBoard = () => {
    const newBoard = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
    addNewTile(newBoard);
    addNewTile(newBoard);
    setGameState({
      board: newBoard,
      score: 0,
      gameOver: false,
    });
  };

  // Rastgele boş hücreye yeni sayı ekleme
  const addNewTile = (board: BoardType) => {
    const emptyCells = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (board[i][j] === 0) {
          emptyCells.push({ x: i, y: j });
        }
      }
    }

    if (emptyCells.length > 0) {
      const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      board[randomCell.x][randomCell.y] = STARTING_NUMBER;
    }
  };

  // Tahtayı sola kaydırma
  const moveLeft = (board: BoardType): boolean => {
    let moved = false;
    const newBoard = board.map(row => [...row]);

    for (let i = 0; i < BOARD_SIZE; i++) {
      let position = 0;
      for (let j = 1; j < BOARD_SIZE; j++) {
        if (newBoard[i][j] !== 0) {
          if (newBoard[i][position] === 0) {
            newBoard[i][position] = newBoard[i][j];
            newBoard[i][j] = 0;
            moved = true;
          } else if (newBoard[i][position] === newBoard[i][j]) {
            newBoard[i][position] *= 2;
            newBoard[i][j] = 0;
            position++;
            moved = true;
          } else {
            position++;
            if (position !== j) {
              newBoard[i][position] = newBoard[i][j];
              newBoard[i][j] = 0;
              moved = true;
            }
          }
        }
      }
    }

    return moved;
  };

  // Tahtayı sağa kaydırma
  const moveRight = (board: BoardType): boolean => {
    const rotatedBoard = rotateBoard(board, 2);
    const moved = moveLeft(rotatedBoard);
    const result = rotateBoard(rotatedBoard, 2);
    return moved;
  };

  // Tahtayı yukarı kaydırma
  const moveUp = (board: BoardType): boolean => {
    const rotatedBoard = rotateBoard(board, 1);
    const moved = moveLeft(rotatedBoard);
    const result = rotateBoard(rotatedBoard, 3);
    return moved;
  };

  // Tahtayı aşağı kaydırma
  const moveDown = (board: BoardType): boolean => {
    const rotatedBoard = rotateBoard(board, 3);
    const moved = moveLeft(rotatedBoard);
    const result = rotateBoard(rotatedBoard, 1);
    return moved;
  };

  // Tahtayı döndürme yardımcı fonksiyonu
  const rotateBoard = (board: BoardType, times: number): BoardType => {
    let newBoard = board.map(row => [...row]);
    for (let i = 0; i < times; i++) {
      newBoard = newBoard[0].map((_, index) =>
        newBoard.map(row => row[index]).reverse()
      );
    }
    return newBoard;
  };

  // Oyun durumunu kontrol etme
  const checkGameOver = (board: BoardType): boolean => {
    // Boş hücre kontrolü
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (board[i][j] === 0) return false;
      }
    }

    // Birleştirilebilir hücre kontrolü
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE - 1; j++) {
        if (board[i][j] === board[i][j + 1]) return false;
        if (board[j][i] === board[j + 1][i]) return false;
      }
    }

    return true;
  };

  // Hamle yapma
  const makeMove = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (gameState.gameOver) return;

    const { board } = gameState;
    let moved = false;

    switch (direction) {
      case 'left':
        moved = moveLeft(board);
        break;
      case 'right':
        moved = moveRight(board);
        break;
      case 'up':
        moved = moveUp(board);
        break;
      case 'down':
        moved = moveDown(board);
        break;
    }

    if (moved) {
      addNewTile(board);
      const gameOver = checkGameOver(board);
      setGameState(prev => ({
        ...prev,
        board: [...board],
        gameOver,
      }));
    }
  };

  // Stil tanımlamaları
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#faf8ef',
      alignItems: 'center',
      justifyContent: 'center',
    },
    board: {
      backgroundColor: '#bbada0',
      padding: CELL_PADDING,
      borderRadius: 6,
    },
    row: {
      flexDirection: 'row',
    },
    cell: {
      width: CELL_SIZE,
      height: CELL_SIZE,
      backgroundColor: '#ccc0b3',
      margin: CELL_PADDING,
      borderRadius: 3,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cellText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#776e65',
    },
    button: {
      marginTop: 20,
      padding: 10,
      backgroundColor: '#8f7a66',
      borderRadius: 3,
    },
    buttonText: {
      color: '#f9f6f2',
      fontSize: 18,
      fontWeight: 'bold',
    },
  });

  // Renk haritası
  const getCellColor = (value: number): string => {
    const colorMap: { [key: number]: string } = {
      0: '#ccc0b3',
      3: '#eee4da',
      6: '#ede0c8',
      12: '#f2b179',
      24: '#f59563',
      48: '#f67c5f',
      96: '#f65e3b',
      192: '#edcf72',
      384: '#edcc61',
      768: '#edc850',
      1536: '#edc53f',
      3072: '#edc22e',
    };
    return colorMap[value] || '#edc22e';
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.board}>
        {gameState.board.map((row, i) => (
          <View key={i} style={styles.row}>
            {row.map((cell, j) => (
              <View
                key={`${i}-${j}`}
                style={[
                  styles.cell,
                  { backgroundColor: getCellColor(cell) },
                ]}>
                <Text style={styles.cellText}>
                  {cell !== 0 ? cell.toString() : ''}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => initializeBoard()}>
        <Text style={styles.buttonText}>Yeni Oyun</Text>
      </TouchableOpacity>

      {gameState.gameOver && Alert.alert('Oyun Bitti!', 'Yeni bir oyun başlatın')}
    </GestureHandlerRootView>
  );
};

export default Game;