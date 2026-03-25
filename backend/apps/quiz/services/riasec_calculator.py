"""
RIASEC score calculation service
"""

from typing import Dict, List, Tuple
from ..models import QuizChoice


class RiasecCalculator:
    """
    Service class for calculating RIASEC scores from quiz answers
    """
    
    RIASEC_TYPES = ['R', 'I', 'A', 'S', 'E', 'C']
    
    @staticmethod
    def calculate_scores(answers: List[Dict]) -> Dict[str, int]:
        """
        Calculate RIASEC scores from user answers
        
        Args:
            answers: List of dicts with 'question_id' and 'choice_key'
        
        Returns:
            Dict with RIASEC scores, e.g., {'R': 5, 'I': 12, 'A': 8, ...}
        """
        scores = {riasec_type: 0 for riasec_type in RiasecCalculator.RIASEC_TYPES}
        
        for answer in answers:
            question_id = answer.get('question_id')
            choice_key = answer.get('choice_key')
            
            try:
                choice = QuizChoice.objects.get(
                    question_id=question_id,
                    choice_key=choice_key
                )
                
                riasec_scores = choice.riasec_scores
                for riasec_type, score in riasec_scores.items():
                    if riasec_type in scores:
                        scores[riasec_type] += score
            
            except QuizChoice.DoesNotExist:
                continue
        
        return scores
    
    @staticmethod
    def get_top_types(scores: Dict[str, int]) -> Tuple[str, str]:
        """
        Get top 2 RIASEC types from scores
        
        Returns:
            Tuple of (top_type, second_type)
        """
        sorted_scores = sorted(
            scores.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        top_type = sorted_scores[0][0] if sorted_scores else 'I'
        second_type = sorted_scores[1][0] if len(sorted_scores) > 1 else ''
        
        return top_type, second_type
    
    @staticmethod
    def calculate_result(answers: List[Dict]) -> Dict:
        """
        Calculate complete quiz result
        
        Returns:
            Dict with 'riasec_scores', 'top_type', 'second_type'
        """
        scores = RiasecCalculator.calculate_scores(answers)
        top_type, second_type = RiasecCalculator.get_top_types(scores)
        
        return {
            'riasec_scores': scores,
            'top_type': top_type,
            'second_type': second_type,
        }
